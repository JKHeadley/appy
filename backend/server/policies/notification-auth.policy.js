'use strict'

const Boom = require('boom')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/error-helper')

const internals = {}

/**
 * Policy to enforce auth for notification updates.
 * @param mongoose
 * @returns {notificationUpdateAuth}
 */
internals.notificationUpdateAuth = function(mongoose) {
  const notificationUpdateAuth = async function notificationAuth(request, h) {
    const Log = request.logger.bind('notificationAuth')

    try {
      const Connection = mongoose.model('notification')

      let userId = request.auth.credentials.user._id

      let result = await RestHapi.find(Connection, request.params._id, {}, Log)
      // Only the primary user and those with root permissions can update the notification
      if (
        userId === result.primaryUser.toString() ||
        request.auth.credentials.scope.includes('root')
      ) {
        return h.continue
      } else {
        throw Boom.forbidden('Not primary user')
      }
    } catch (err) {
      errorHelper.handleError(err, Log)
    }
  }

  notificationUpdateAuth.applyPoint = 'onPreHandler'
  return notificationUpdateAuth
}
internals.notificationUpdateAuth.applyPoint = 'onPreHandler'

module.exports = internals.notificationUpdateAuth
