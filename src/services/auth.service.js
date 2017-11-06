import axios from 'axios'
import config from '../config'
import Session from '../services/auth-session.service'

const internals = {}

internals.login = function (email, password) {
  return axios.post('login', {
    email: email,
    password: password
  })
    .then(function (response) {
      console.debug('authService.login-success:\n', response)

      // EXPL: login successful if there's a user in the response
      if (response.data.user) {
        Session.create(response.data)
      } else {
        throw new Error('The response did not contain a user.')
      }

      return response
    })
    .catch(function (error) {
      console.error('authService.login-error:\n', error)
      throw error
    })
}

export default {
  login: internals.login
}
