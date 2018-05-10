'use strict'

const Boom = require('boom')

const internals = {}

/**
 * Policy to restrict certain action for the live demo (such as super admins deleting users).
 * @param request
 * @param reply
 * @param next
 * @returns {*}
 */
internals.demoAuth = function(request, reply, next) {
  let Log = request.logger.bind('demoAuth')

  try {
    return next(Boom.forbidden('Action not allowed for demo'), false)
  } catch (err) {
    Log.error('ERROR:', err)
    return next(null, true)
  }
}
internals.demoAuth.applyPoint = 'onPreHandler'

/**
 * Policy to restrict certain action for the live demo (such as super admins deleting users).
 * @param request
 * @param reply
 * @param next
 * @returns {*}
 */
internals.demoUser = function(request, reply, next) {
  let Log = request.logger.bind('demoUser')

  try {
    let user = request.auth.credentials.user

    if (internals.demoUsers.includes(user.email)) {
      return next(Boom.forbidden('Cannot edit demo user'), false)
    } else {
      return next(null, true)
    }
  } catch (err) {
    Log.error('ERROR:', err, internals.demoUsers)
    return next(null, true)
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
