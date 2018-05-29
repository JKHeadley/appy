'use strict'

const Boom = require('boom')
const errorHelper = require('../utilities/errorHelper')

const internals = {}

/**
 * Policy to restrict certain action for the live demo (such as super admins deleting users).
 * @param request
 * @param h
 * @returns {*}
 */
internals.demoAuth = function(request, h) {
  let Log = request.logger.bind('demoAuth')
  try {
    throw Boom.forbidden('Action not allowed for demo')
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}
internals.demoAuth.applyPoint = 'onPreHandler'

/**
 * Policy to restrict certain action for the live demo (such as super admins deleting users).
 * @param request
 * @param h
 * @returns {*}
 */
internals.demoUser = async function(request, h) {
  let Log = request.logger.bind('demoUser')

  try {
    let user = request.auth.credentials.user

    if (internals.demoUsers.includes(user.email)) {
      throw Boom.forbidden('Cannot edit demo user')
    }

    return h.continue
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}
internals.demoUser.applyPoint = 'onPreHandler'

internals.demoUsers = [
  'test@superadmin.com',
  'test@admin.com',
  'test@user.com',
  'test@readonlyuser.com',
  'test@readonlyadmin.com',
  'test@editoradmin.com',
  'test@superuseradmin.com'
]

module.exports = {
  demoAuth: internals.demoAuth,
  demoUser: internals.demoUser
}
