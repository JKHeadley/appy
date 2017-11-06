import Vue from 'vue'
import { router } from '../main'

import { RESPONSE_MESSAGES } from '../config'
import Session from './auth-session.service'

const internals = {}

internals.responseError = function(error) {
  let response = error.response;

  console.log("INTERCEPTED:", response);

  // var Notification = $injector.get('Notification');
  // var Session = $injector.get('Session');
  // var $state = $injector.get('$state');

  // EXPL: If the Access Token was expired, allow the apiHelperService to try a refresh token
  if (response.status === 401 && response.data.message === RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN) {
    console.debug('authInterceptor.service: 401: response:', response);

    response = RESPONSE_MESSAGES.EXPIRED_ACCESS_TOKEN;
  }
  else if (response.status === 401) { // EXPL: If the token was invalid or the Refresh Token was expired, force user to login
    console.debug('authInterceptor.service: 401: response:', response);
    console.debug('Session intercept:', Session);

    // call singleton to wipe session
    Session.destroy();
    // direct call to null token so user is unAuthenticated
    // to pass route resolve on login route
    Session.authHeader = null;
    Session.refreshToken = null;

    // redirect to login page
    // $state.go(REDIRECT.LOGIN);

    console.log("VUE:", router)

    router.push('/login')
  }
  else if (response.status === 403) { // EXPL: The user is unauthorized
    console.debug('authInterceptor.service: 403: response:', response);

    Notification.warning('You are not authorized for that action.');
  }
  /* If not a 401 or 403, do nothing with this error.
   * This is necessary to make a `responseError`
   * interceptor a no-op. */
  return Promise.reject(response);
}

export default {
  responseError: internals.responseError
}
