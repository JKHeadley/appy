import vm from '../main'

const internals = {}

internals.updateUser = function (user) {
  user = Object.assign({}, user)
  delete user.roleName
  delete user.isActive
  // delete user.permissions
  delete user.groups
  return vm.$userRepository.update(user._id, user)
}

export default internals
