import validator from 'validator'

const internals = {}

internals.emailValidator = (email) => {
  return validator.isEmail(email)
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
