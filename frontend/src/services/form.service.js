import validator from 'validator'
import { httpClient as http } from './index'
import { API, REQUIRED_PASSWORD_STRENGTH } from '../config/index'

const internals = {}

internals.minlengthValidator = (input, minlength) => {
  return input.length >= minlength
}

internals.emailValidator = email => {
  return validator.isEmail(email)
}

// NOTE: For more secure applications, the user should never be notified if an email exists in the system.
// For more information, refer to the links below:
// https://postmarkapp.com/guides/password-reset-email-best-practices
// https://security.stackexchange.com/questions/40694/disclose-to-user-if-account-exists
internals.emailUniqueValidator = (email, originalEmail) => {
  return new Promise((resolve, reject) => {
    if (email === originalEmail) {
      resolve(true)
    } else {
      http
        .post(API.USER + '/check-email', { email })
        .then(function(result) {
          resolve(!result.data)
        })
        .catch(function(error) {
          console.error('formService.emailUniqueValidator-error:\n', error)
          reject(error)
        })
    }
  })
}

internals.passwordScoreValidator = passwordScore => {
  return passwordScore >= REQUIRED_PASSWORD_STRENGTH
}

internals.passwordConfirmValidator = (newPassword, confirmPassword) => {
  return newPassword === confirmPassword
}

internals.fieldClassName = field => {
  if (!field) {
    return ''
  }
  if ((field.$touched || field.$submitted) && field.$valid) {
    return ['has-success', 'has-feedback']
  }
  if ((field.$touched || field.$submitted) && field.$invalid) {
    return ['has-error', 'has-feedback']
  }
}

export default internals
