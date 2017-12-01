import _ from 'lodash'

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
