import vm from '../main'
import { API } from '../config'
import http from '../services/http-client.service'

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

export default internals
