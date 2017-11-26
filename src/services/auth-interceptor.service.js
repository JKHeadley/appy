import store from '../store'
import vm from '../main'

import { RESPONSE_MESSAGES } from '../config'

const internals = {}

internals.responseError = function (error) {
  let response = error.response

  // var Notification = $injector.get('Notification');

  // EXPL: If the access token was expired, allow the apiHelperService to try a refresh token
  if (response.status === 401 && response.data.message === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
    console.debug('authInterceptor.service: 401: response:', response)

    response = RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN

  // EXPL: If the token was invalid or the Refresh Token was expired, force user to login
  } else if (response.status === 401) {
    console.debug('authInterceptor.service: 401: response:', response)

    store.dispatch('auth/clearAuth')

    vm.$router.push('/login')
  } else if (response.status === 403) { // EXPL: The user is unauthorized
    console.debug('authInterceptor.service: 403: response:', response)

    // Notification.warning('You are not authorized for that action.')
  }
  // EXPL: If not a 401 or 403, do nothing with this error. This is necessary to make a `responseError`
  // interceptor a no-op. */
  return Promise.reject(response)
}

export default {
  responseError: internals.responseError
}
