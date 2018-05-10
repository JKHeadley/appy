import _ from 'lodash'

import vm from '../main'

const internals = {}

internals.createPermission = function(permission) {
  permission = Object.assign({}, permission)

  const users = (permission.users || []).concat([]).map(user => {
    return user.user._id
  })
  const groups = (permission.groups || []).concat([]).map(group => {
    return { childId: group.group._id, state: group.state }
  })

  delete permission.groups
  delete permission.users

  const promises = []
  return vm.$permissionRepository
    .create(permission)
    .then(result => {
      permission = result.data
      if (!_.isEmpty(users)) {
        promises.push(
          vm.$permissionRepository.addManyUsers(permission._id, users)
        )
      }
      if (!_.isEmpty(groups)) {
        promises.push(
          vm.$permissionRepository.addManyGroups(permission._id, groups)
        )
      }

      return Promise.all(promises)
    })
    .catch(error => {
      console.error('permissionService.createPermission-error:\n', error)
      throw error
    })
}

internals.updatePermission = function(newPermission, oldPermission) {
  newPermission = Object.assign({}, newPermission)
  oldPermission = Object.assign({}, oldPermission)

  const newUsers = (newPermission.users || []).concat([])
  const oldUsers = (oldPermission.users || []).concat([])
  const newGroups = (newPermission.groups || []).concat([])
  const oldGroups = (oldPermission.groups || []).concat([])

  delete newPermission.users
  delete newPermission.groups

  const promises = []
  promises.push(
    vm.$permissionRepository.update(newPermission._id, newPermission)
  )
  promises.push(
    internals.updatePermissionGroups(newPermission._id, newGroups, oldGroups)
  )
  promises.push(
    internals.updatePermissionUsers(newPermission._id, newUsers, oldUsers)
  )

  return Promise.all(promises)
}

internals.updatePermissionUsers = function(permissionId, newUsers, oldUsers) {
  // Add any new users or updated users who's state has changed for this permission.
  let usersToAdd = newUsers
    .filter(newUser => {
      return !oldUsers.find(oldUser => {
        return (
          oldUser.user._id === newUser.user._id &&
          oldUser.state === newUser.state
        )
      })
    })
    .map(user => {
      return { childId: user.user._id, state: user.state }
    })

  let usersToRemove = oldUsers
    .filter(oldUser => {
      return !newUsers.find(newUser => {
        return oldUser.user._id === newUser.user._id
      })
    })
    .map(user => {
      return user.user._id
    })

  let promise = _.isEmpty(usersToAdd)
    ? Promise.resolve()
    : vm.$permissionRepository.addManyUsers(permissionId, usersToAdd)

  return promise.then(() => {
    return _.isEmpty(usersToRemove)
      ? Promise.resolve()
      : vm.$permissionRepository.removeManyUsers(permissionId, usersToRemove)
  })
}

internals.updatePermissionGroups = function(
  permissionId,
  newGroups,
  oldGroups
) {
  // Add any new groups or updated groups who's state has changed for this permission.
  let groupsToAdd = newGroups
    .filter(newGroup => {
      return !oldGroups.find(oldGroup => {
        return (
          oldGroup.group._id === newGroup.group._id &&
          oldGroup.state === newGroup.state
        )
      })
    })
    .map(group => {
      return { childId: group.group._id, state: group.state }
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
    : vm.$permissionRepository.addManyGroups(permissionId, groupsToAdd)

  return promise.then(() => {
    return _.isEmpty(groupsToRemove)
      ? Promise.resolve()
      : vm.$permissionRepository.removeManyGroups(permissionId, groupsToRemove)
  })
}

export default internals
