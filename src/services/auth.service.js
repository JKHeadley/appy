import _ from 'lodash'

import vm from '../main'
import { httpClient as http } from '../services'

const internals = {}

internals.inviteUser = function (user) {
  user = Object.assign({}, user)
  user.role = user.role.name
  delete user.isActive
  delete user.isEnabled

  const groups = (user.groups || []).concat([]).map((group) => { return group.group._id })
  const permissions = (user.permissions || []).concat([]).map((permission) => {
    return { childId: permission.permission._id, state: permission.state }
  })

  delete user.permissions
  delete user.groups

  const promises = []
  return http.post('/register', { user, registerType: 'Invite' })
    .then((result) => {
      user = result.data
      if (!_.isEmpty(groups)) {
        promises.push(vm.$userRepository.addManyGroups(user._id, groups))
      }
      if (!_.isEmpty(permissions)) {
        promises.push(vm.$userRepository.addManyPermissions(user._id, permissions))
      }

      return Promise.all(promises)
    })
}

export default internals
