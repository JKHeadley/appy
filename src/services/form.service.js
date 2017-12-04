import validator from 'validator'
import { httpClient as http } from './index'
import { API } from '../config/index'

const internals = {}

internals.emailValidator = (email) => {
  return validator.isEmail(email)
}

internals.emailUniqueValidator = (email, originalEmail) => {
  return new Promise((resolve, reject) => {
    if (email === originalEmail) {
      resolve(true)
    } else {
      http.post(API.USER + '/check-email', { email })
        .then(function (result) {
          resolve(!result.data)
        })
        .catch(function (error) {
          console.error('formService.emailUniqueValidator-error:\n', error)
          reject(error)
        })
    }
  })
}

internals.fieldClassName = (field) => {
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
