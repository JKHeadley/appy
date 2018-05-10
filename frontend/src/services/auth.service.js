import store from '../store'
import _ from 'lodash'

import vm from '../main'
import { httpClient as http } from '../services'

const internals = {}

internals.login = credentials => {
  return http
    .post('/login', credentials)
    .then(response => {
      store.dispatch('auth/setAuth', response.data)
    })
    .catch(error => {
      console.error('authService.login-error:\n', error)
      throw error
    })
}

internals.loginSocial = token => {
  return http
    .post('login/social', { token })
    .then(response => {
      store.dispatch('auth/setAuth', response.data)
    })
    .catch(error => {
      console.error('authService.loginSocial-error:\n', error)
      throw error
    })
}

internals.logout = () => {
  store.dispatch('auth/useRefreshToken')
  return http
    .delete('/logout')
    .then(response => {
      store.dispatch('auth/clearAuth')
    })
    .catch(error => {
      console.error('authService.logout-error:\n', error)
      throw error
    })
}

internals.registerUser = user => {
  return http
    .post('/register', { user, registerType: 'Register' })
    .catch(error => {
      console.error('authService.registerUser-error:\n', error)
      throw error
    })
}

internals.inviteUser = user => {
  user = Object.assign({}, user)
  user.role = user.role.name
  delete user.isActive
  delete user.isEnabled

  const groups = (user.groups || []).concat([]).map(group => {
    return group.group._id
  })
  const permissions = (user.permissions || []).concat([]).map(permission => {
    return { childId: permission.permission._id, state: permission.state }
  })

  delete user.permissions
  delete user.groups

  const promises = []
  return http
    .post('/register', { user, registerType: 'Invite' })
    .then(result => {
      user = result.data
      if (!_.isEmpty(groups)) {
        promises.push(vm.$userRepository.addManyGroups(user._id, groups))
      }
      if (!_.isEmpty(permissions)) {
        promises.push(
          vm.$userRepository.addManyPermissions(user._id, permissions)
        )
      }

      return Promise.all(promises)
    })
    .catch(error => {
      console.error('authService.inviteUser-error:\n', error)
      throw error
    })
}

internals.sendActivationEmail = email => {
  return http
    .post('/register/send-activation-email', { email })
    .catch(error => {
      console.error('authService.sendActivationEmail-error:\n', error)
      throw error
    })
}

internals.sendResetLink = email => {
  return http.post('/login/forgot', { email }).catch(error => {
    console.error('authService.sendResetLink-error:\n', error)
    throw error
  })
}

internals.resetPassword = (token, password, pin) => {
  return http.post('/login/reset', { token, password, pin }).catch(error => {
    console.error('authService.resetPassword-error:\n', error)
    throw error
  })
}

internals.activateAccount = token => {
  return http.post('/register/activate', { token }).catch(error => {
    console.error('authService.activateAccount-error:\n', error)
    throw error
  })
}

export default internals
