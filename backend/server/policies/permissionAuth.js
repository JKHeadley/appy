'use strict'

const Boom = require('boom')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/errorHelper')

const internals = {}

/**
 * Policy to enforce auth for assigning permissions.
 * @param mongoose
 * @param isOwner: True if permission is the owner model, false otherwise.
 * @returns {permissionAuth}
 */
internals.permissionAuth = function(mongoose, isOwner) {
  const permissionAuth = async function permissionAuth(request, h) {
    let Log = request.logger.bind('permissionAuth')

    try {
      // Return next if this isn't a permission association
      if (!isOwner && !request.path.includes('permission')) {
        return h.continue
      }
      let userScope = request.auth.credentials.scope

      // Always allow root
      if (userScope.indexOf('root') > -1) {
        return h.continue
      }

      if (isOwner) {
        let canAssign = await internals.canAssign(request.params.ownerId, userScope, mongoose, Log)
        return internals.formatResponse(canAssign, h, Log)
      } else if (request.params.childId) {
        let canAssign = await internals.canAssign(request.params.childId, userScope, mongoose, Log)
        return internals.formatResponse(canAssign, h, Log)
      }
      // Multiple permissions are being assigned so we need to check each one.
      else {
        const permissionIds = request.payload.map(
          object => object.childId || object
        )
        let promises = []
        permissionIds.forEach(permissionId =>
          promises.push(
            internals.canAssign(permissionId, userScope, mongoose, Log)
          )
        )

        let result = await Promise.all(promises)
        // If any of the checks fail, then an error is returned
        let canAssign =
          result.filter(canAssign => canAssign === false)[0] === undefined

        return internals.formatResponse(canAssign, h, Log)
      }
    } catch (err) {
      errorHelper.handleError(err, Log)
    }
  }

  permissionAuth.applyPoint = 'onPreHandler'
  return permissionAuth
}
internals.permissionAuth.applyPoint = 'onPreHandler'

internals.canAssign = async function(permissionId, userScope, mongoose, logger) {
  const Log = logger.bind()

  try {
    const Permission = mongoose.model('permission')

    let result = await RestHapi.find(Permission, permissionId, {}, Log)
    let assignScope = result.assignScope
    // Check if the user scope intersects (contains values of) the assign scope.
    let canAssign = !!userScope.filter(
      scope => assignScope.indexOf(scope) > -1
    )[0]

    return canAssign
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}

internals.formatResponse = function(canAssign, h, logger) {
  const Log = logger.bind()

  try {
    if (canAssign.isBoom) {
      throw canAssign
    }

    if (canAssign) {
      return h.continue
    } else {
      throw Boom.forbidden('Higher role required to assign permission')
    }
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}

module.exports = internals.permissionAuth
