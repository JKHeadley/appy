import _ from 'lodash'

import vm from '../main'
import { API, PERMISSION_STATES } from '../config'
import { httpClient as http } from '../services'

const internals = {}

internals.updateUser = function(newUser, oldUser) {
  newUser = Object.assign({}, newUser)
  oldUser = Object.assign({}, oldUser)
  newUser.role = newUser.role._id

  // Filter out properties not needed
  newUser = (({ email, firstName, lastName, role, groups, permissions }) => {
    return { email, firstName, lastName, role, groups, permissions }
  })(newUser)

  const newGroups = (newUser.groups || []).concat([])
  const oldGroups = (oldUser.groups || []).concat([])
  const newPermissions = (newUser.permissions || []).concat([])
  const oldPermissions = (oldUser.permissions || []).concat([])

  delete newUser.permissions
  delete newUser.groups

  const promises = []
  promises.push(vm.$userRepository.update(oldUser._id, newUser))
  promises.push(internals.updateUserGroups(oldUser._id, newGroups, oldGroups))
  promises.push(
    internals.updateUserPermissions(oldUser._id, newPermissions, oldPermissions)
  )

  return Promise.all(promises)
}

internals.updateUserGroups = function(userId, newGroups, oldGroups) {
  let groupsToAdd = newGroups
    .filter(newGroup => {
      return !oldGroups.find(oldGroup => {
        return oldGroup.group._id === newGroup.group._id
      })
    })
    .map(group => {
      return group.group._id
    })

  let groupsToRemove = oldGroups
    .filter(oldGroup => {
      return !newGroups.find(newGroup => {
        return oldGroup.group._id === newGroup.group._id
      })
    })
    .map(group => {
      return group.group._id
    })

  let promise = _.isEmpty(groupsToAdd)
    ? Promise.resolve()
    : vm.$userRepository.addManyGroups(userId, groupsToAdd)

  return promise.then(() => {
    return _.isEmpty(groupsToRemove)
      ? Promise.resolve()
      : vm.$userRepository.removeManyGroups(userId, groupsToRemove)
  })
}

internals.updateUserPermissions = function(
  userId,
  newPermissions,
  oldPermissions
) {
  // Add any new permissions or updated permissions who's state has changed.
  let permissionsToAdd = newPermissions
    .filter(newPermission => {
      return !oldPermissions.find(oldPermission => {
        return (
          oldPermission.permission._id === newPermission.permission._id &&
          oldPermission.state === newPermission.state
        )
      })
    })
    .map(permission => {
      return { childId: permission.permission._id, state: permission.state }
    })

  let permissionsToRemove = oldPermissions
    .filter(oldPermission => {
      return !newPermissions.find(newPermission => {
        return oldPermission.permission._id === newPermission.permission._id
      })
    })
    .map(permission => {
      return permission.permission._id
    })

  let promise = _.isEmpty(permissionsToAdd)
    ? Promise.resolve()
    : vm.$userRepository.addManyPermissions(userId, permissionsToAdd)

  return promise.then(() => {
    return _.isEmpty(permissionsToRemove)
      ? Promise.resolve()
      : vm.$userRepository.removeManyPermissions(userId, permissionsToRemove)
  })
}

internals.getAvailablePermissions = query => {
  return http.get(API.PERMISSION + '/available', query)
}

internals.updateUserProfile = profile => {
  return http.put(API.USER + '/my/profile', { profile })
}

internals.deleteCurrentAccount = () => {
  return http.delete(API.USER + '/my')
}

internals.updateUserPassword = password => {
  return http.put(API.USER + '/my/password', { password })
}

internals.updateUserPIN = pin => {
  return http.put(API.USER + '/my/pin', { pin })
}

internals.checkPassword = (password, userInputs) => {
  return http.post(API.USER + '/check-password', { password })
}

internals.getUserScope = function(userId) {
  return http.get(API.USER + '/' + userId + '/scope')
}

internals.disableUser = function(userId) {
  return http.put(API.USER + '/' + userId + '/disable')
}

internals.enableUser = function(userId) {
  return http.put(API.USER + '/' + userId + '/enable')
}

internals.activateUser = function(userId) {
  return http.put(API.USER + '/' + userId + '/activate')
}

internals.deactivateUser = function(userId) {
  return http.put(API.USER + '/' + userId + '/deactivate')
}

internals.getConnectionStats = function(userId) {
  return http.get(API.USER + '/' + userId + '/connection-stats')
}

/**
 * Gets the effective permissions for a user which are determined by the permissions hierarchy.
 * For more details,
 * @param role
 * @param groups
 * @param permissions
 * @returns {Array|*|resources.user.associations.permissions|{alias}|resources.role.associations.permissions|resources.group.associations.permissions}
 */
internals.getEffectivePermissions = (role, groups, permissions) => {
  // base permissions are set by the user's role
  const effectivePermissions = role.permissions.concat([])

  // group permissions override role permissions
  for (let group of groups) {
    for (let groupPermission of group.group.permissions) {
      let matchIndex = -1
      effectivePermissions.find((permission, index) => {
        if (permission.permission._id === groupPermission.permission._id) {
          matchIndex = index
          return true
        }
      })

      if (matchIndex > -1) {
        effectivePermissions[matchIndex] = groupPermission
      } else {
        effectivePermissions.push(groupPermission)
      }
    }
  }

  // user permissions override group permissions
  for (let userPermission of permissions) {
    let matchIndex = -1
    effectivePermissions.find((permission, index) => {
      if (permission.permission._id === userPermission.permission._id) {
        matchIndex = index
        return true
      }
    })

    if (matchIndex > -1) {
      effectivePermissions[matchIndex] = userPermission
    } else {
      effectivePermissions.push(userPermission)
    }
  }

  return effectivePermissions
}

/**
 * Gets scope specific to the user. By default this is just 'user-{userId}'.
 * @param user
 * @returns {Array}
 */
internals.getSpecificScope = user => {
  const scope = []
  scope.push('user-' + user._id)
  return scope
}

/**
 * Computes the scope for a user, which consists of their role name, group names, effective permissions, and
 * any permissions specific to the user.
 * @param user
 * @param role
 * @param groups
 * @param permissions
 * @returns {Array}
 */
internals.computeUserScope = user => {
  const effectivePermissions = internals.getEffectivePermissions(
    user.role,
    user.groups,
    user.permissions
  )

  let computedScope = []
  computedScope.push(user.role.name)
  computedScope = computedScope.concat(
    user.groups.map(group => {
      return group.group.name
    })
  )

  /**
   * The scope additions from permissions depends on the permission state as follows:
   * Included: the permission is included in the scope
   * Excluded: the permission is excluded from the scope
   * Forbidden: the permission is included with a '-' prefix
   */
  computedScope = computedScope.concat(
    effectivePermissions
      .map(permission => {
        switch (permission.state) {
          case PERMISSION_STATES.INCLUDED:
            return permission.permission.name
          case PERMISSION_STATES.EXCLUDED:
            return
          case PERMISSION_STATES.FORBIDDEN:
            return '-' + permission.permission.name
        }
      })
      .filter(Boolean)
  )

  const specificScope = internals.getSpecificScope(user)

  computedScope = computedScope.concat(specificScope)

  return computedScope
}

export default internals
