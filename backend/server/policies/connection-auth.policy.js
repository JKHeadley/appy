'use strict'

const Boom = require('boom')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/error-helper')

const internals = {}

/**
 * Policy to enforce auth for connection updates.
 * @param mongoose
 * @returns {connectionUpdateAuth}
 */
internals.connectionUpdateAuth = function(mongoose) {
  const connectionUpdateAuth = async function connectionAuth(request, h) {
    const Log = request.logger.bind('connectionAuth')

    try {
      const Connection = mongoose.model('connection')

      let userId = request.auth.credentials.user._id

      let result = await RestHapi.find(Connection, request.params._id, {}, Log)
      // Only the primary user and those with root permissions can update the connection
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

  connectionUpdateAuth.applyPoint = 'onPreHandler'
  return connectionUpdateAuth
}
internals.connectionUpdateAuth.applyPoint = 'onPreHandler'

module.exports = internals.connectionUpdateAuth
