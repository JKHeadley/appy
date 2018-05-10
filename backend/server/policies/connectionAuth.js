'use strict'

const Boom = require('boom')
const RestHapi = require('rest-hapi')

const internals = {}

/**
 * Policy to enforce auth for connection updates.
 * @param mongoose
 * @returns {connectionUpdateAuth}
 */
internals.connectionUpdateAuth = function(mongoose) {
  const connectionUpdateAuth = function connectionAuth(request, reply, next) {
    let Log = request.logger.bind('connectionAuth')

    try {
      const Connection = mongoose.model('connection')

      let userId = request.auth.credentials.user._id

      return RestHapi.find(Connection, request.params._id, {}, Log).then(
        function(result) {
          // Only the primary user and those with root permissions can update the connection
          if (
            userId === result.primaryUser.toString() ||
            request.auth.credentials.scope.includes('root')
          ) {
            return next(null, true)
          } else {
            return next(Boom.forbidden('Not primary user'), false)
          }
        }
      )
    } catch (err) {
      Log.error('ERROR:', err)
      return next(null, true)
    }
  }

  connectionUpdateAuth.applyPoint = 'onPreHandler'
  return connectionUpdateAuth
}
internals.connectionUpdateAuth.applyPoint = 'onPreHandler'

module.exports = internals.connectionUpdateAuth
