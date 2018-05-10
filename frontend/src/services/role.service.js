import _ from 'lodash'

import vm from '../main'

const internals = {}

internals.createRole = function(role) {
  role = Object.assign({}, role)

  const permissions = (role.permissions || []).concat([]).map(permission => {
    return { childId: permission.permission._id, state: permission.state }
  })

  delete role.permissions

  const promises = []
  return vm.$roleRepository
    .create(role)
    .then(result => {
      role = result.data
      if (!_.isEmpty(permissions)) {
        promises.push(
          vm.$roleRepository.addManyPermissions(role._id, permissions)
        )
      }

      return Promise.all(promises)
    })
    .catch(error => {
      console.error('roleService.createRole-error:\n', error)
      throw error
    })
}

internals.updateRole = function(newRole, oldRole) {
  newRole = Object.assign({}, newRole)
  oldRole = Object.assign({}, oldRole)

  const newPermissions = (newRole.permissions || []).concat([])
  const oldPermissions = (oldRole.permissions || []).concat([])

  delete newRole.permissions

  const promises = []
  promises.push(vm.$roleRepository.update(newRole._id, newRole))
  promises.push(
    internals.updateRolePermissions(newRole._id, newPermissions, oldPermissions)
  )

  return Promise.all(promises)
}

internals.updateRolePermissions = function(
  roleId,
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
        return (
          oldPermission.permission._id === newPermission.permission._id &&
          oldPermission.state === newPermission.state
        )
      })
    })
    .map(permission => {
      return permission.permission._id
    })

  let promise = _.isEmpty(permissionsToAdd)
    ? Promise.resolve()
    : vm.$roleRepository.addManyPermissions(roleId, permissionsToAdd)

  return promise.then(() => {
    return _.isEmpty(permissionsToRemove)
      ? Promise.resolve()
      : vm.$roleRepository.removeManyPermissions(roleId, permissionsToRemove)
  })
}

export default internals
