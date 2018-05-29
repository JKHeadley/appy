'use strict'

const _ = require('lodash')
const pickDeep = require('lodash-pickdeep')
const errorHelper = require('../utilities/errorHelper')

_.mixin({ pickDeep: pickDeep }, { chain: true })

const internals = {}

/**
 * Policy to log actions.
 * @param mongoose
 * @param options
 * @param logger
 * @returns {auditLog}
 */
internals.auditLog = function(mongoose, options, logger) {
  const Log = logger.bind('auditLog')

  const auditLog = async function auditLog(request, h) {
    try {
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = request.server.methods.getIP(request)
      let userId = _.get(request.auth.credentials, 'user._id')

      let payload = {}
      if (options.payloadFilter) {
        payload = _.pickDeep(request.payload, options.payloadFilter)
      } else {
        payload = request.payload
      }

      const document = {
        method: request.method.toUpperCase(),
        action: options.action || null,
        endpoint: request.path,
        user: userId || null,
        collectionName: options.collectionName || null,
        childCollectionName: options.childCollectionName || null,
        associationType: options.associationType || null,
        documents: options.documents || null,
        payload: _.isEmpty(payload) ? null : payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      }

      await AuditLog.create(document)

      return h.continue
    } catch (err) {
      errorHelper.handleError(err, Log)
    }
  }

  auditLog.applyPoint = 'onPostHandler'
  return auditLog
}
internals.auditLog.applyPoint = 'onPostHandler'

module.exports = internals.auditLog
