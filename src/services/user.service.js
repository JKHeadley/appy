import _ from 'lodash'

import vm from '../main'
import { API, PERMISSION_STATES } from '../config'
import { httpClient as http } from '../services'

const internals = {}

internals.updateUser = function (user) {
  user = Object.assign({}, user)
  delete user.roleName
  delete user.isActive
  delete user.isEnabled
  delete user.permissions
  delete user.groups
  return vm.$userRepository.update(user._id, user)
}

internals.updateUserGroups = function (user, newGroups) {
  const oldGroups = user.groups

  let groupsToAdd = newGroups.filter((newGroup) => {
    return !oldGroups.find((oldGroup) => { return oldGroup.group._id === newGroup.group._id })
  }).map((object) => { return object.group._id })

  let groupsToRemove = oldGroups.filter((oldGroup) => {
    return !newGroups.find((newGroup) => { return oldGroup.group._id === newGroup.group._id })
  }).map((object) => { return object.group._id })

  let promise = _.isEmpty(groupsToAdd) ? Promise.resolve() : vm.$userRepository.addManyGroups(user._id, groupsToAdd)

  return promise
    .then(() => {
      return _.isEmpty(groupsToRemove) ? Promise.resolve() : vm.$userRepository.removeManyGroups(user._id, groupsToRemove)
    })
}

internals.updateUserPermissions = function (user, newPermissions) {
  const oldPermissions = user.permissions

  let permissionsToAdd = newPermissions.filter((newPermission) => {
    return !oldPermissions.find((oldPermission) => { return oldPermission.permission._id === newPermission.permission._id })
  }).map((object) => { return object.permission._id })

  let permissionsToRemove = oldPermissions.filter((oldPermission) => {
    return !newPermissions.find((newPermission) => { return oldPermission.permission._id === newPermission.permission._id })
  }).map((object) => { return object.permission._id })

  let promise = _.isEmpty(permissionsToAdd) ? Promise.resolve() : vm.$userRepository.addManyPermissions(user._id, permissionsToAdd)

  return promise
    .then(() => {
      return _.isEmpty(permissionsToRemove) ? Promise.resolve() : vm.$userRepository.removeManyPermissions(user._id, permissionsToRemove)
    })
}

internals.getUserScope = function (userId) {
  return http.get(API.USER + '/' + userId + '/scope')
}

internals.disableUser = function (user) {
  return http.put(API.USER + '/disable/' + user._id)
}

internals.enableUser = function (user) {
  return http.put(API.USER + '/enable/' + user._id)
}

internals.activateUser = function (user) {
  return http.put(API.USER + '/activate/' + user._id)
}

internals.deactivateUser = function (user) {
  return http.put(API.USER + '/deactivate/' + user._id)
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
  // EXPL: base permissions are set by the user's role
  const effectivePermissions = role.permissions.concat([])

  // EXPL: group permissions override role permissions
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

  // EXPL: user permissions override group permissions
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
internals.getSpecificScope = (user) => {
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
internals.computeUserScope = (user, role, groups, permissions) => {
  const effectivePermissions = internals.getEffectivePermissions(role, groups, permissions)

  let computedScope = []
  computedScope.push(role.name)
  computedScope = computedScope.concat(groups.map((group) => { return group.group.name }))

  /**
   * The scope additions from permissions depends on the permission state as follows:
   * Included: the permission is included in the scope
   * Excluded: the permission is excluded from the scope
   * Forbidden: the permission is included with a '-' prefix
   */
  computedScope = computedScope.concat(effectivePermissions.map((permission) => {
    switch (permission.state) {
      case PERMISSION_STATES.INCLUDED:
        return permission.permission.name
      case PERMISSION_STATES.EXCLUDED:
        return
      case PERMISSION_STATES.FORBIDDEN:
        return '-' + permission.permission.name
    }
  }).filter(Boolean))

  const specificScope = internals.getSpecificScope(user)

  computedScope = computedScope.concat(specificScope)

  return computedScope
}

export default internals
