import _ from 'lodash'

import vm from '../main'

const internals = {}

internals.createGroup = function(group) {
  group = Object.assign({}, group)

  const users = (group.users || []).concat([]).map(user => {
    return user.user._id
  })
  const permissions = (group.permissions || []).concat([]).map(permission => {
    return { childId: permission.permission._id, state: permission.state }
  })

  delete group.permissions
  delete group.users

  const promises = []
  return vm.$groupRepository
    .create(group)
    .then(result => {
      group = result.data
      if (!_.isEmpty(users)) {
        promises.push(vm.$groupRepository.addManyUsers(group._id, users))
      }
      if (!_.isEmpty(permissions)) {
        promises.push(
          vm.$groupRepository.addManyPermissions(group._id, permissions)
        )
      }

      return Promise.all(promises)
    })
    .catch(error => {
      console.error('groupService.createGroup-error:\n', error)
      throw error
    })
}

internals.updateGroup = function(newGroup, oldGroup) {
  newGroup = Object.assign({}, newGroup)
  oldGroup = Object.assign({}, oldGroup)

  const newUsers = (newGroup.users || []).concat([])
  const oldUsers = (oldGroup.users || []).concat([])
  const newPermissions = (newGroup.permissions || []).concat([])
  const oldPermissions = (oldGroup.permissions || []).concat([])

  delete newGroup.users
  delete newGroup.permissions

  const promises = []
  promises.push(vm.$groupRepository.update(newGroup._id, newGroup))
  promises.push(
    internals.updateGroupPermissions(
      newGroup._id,
      newPermissions,
      oldPermissions
    )
  )
  promises.push(internals.updateGroupUsers(newGroup._id, newUsers, oldUsers))

  return Promise.all(promises)
}

internals.updateGroupUsers = function(groupId, newUsers, oldUsers) {
  let usersToAdd = newUsers
    .filter(newUser => {
      return !oldUsers.find(oldUser => {
        return oldUser.user._id === newUser.user._id
      })
    })
    .map(user => {
      return user.user._id
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
    : vm.$groupRepository.addManyUsers(groupId, usersToAdd)

  return promise.then(() => {
    return _.isEmpty(usersToRemove)
      ? Promise.resolve()
      : vm.$groupRepository.removeManyUsers(groupId, usersToRemove)
  })
}

internals.updateGroupPermissions = function(
  groupId,
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
    : vm.$groupRepository.addManyPermissions(groupId, permissionsToAdd)

  return promise.then(() => {
    return _.isEmpty(permissionsToRemove)
      ? Promise.resolve()
      : vm.$groupRepository.removeManyPermissions(groupId, permissionsToRemove)
  })
}

export default internals
