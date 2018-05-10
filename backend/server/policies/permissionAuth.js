'use strict'

const Boom = require('boom')
const RestHapi = require('rest-hapi')
const Q = require('q')

const internals = {}

/**
 * Policy to enforce auth for assigning permissions.
 * @param mongoose
 * @param isOwner: True if permission is the owner model, false otherwise.
 * @returns {permissionAuth}
 */
internals.permissionAuth = function(mongoose, isOwner) {
  const permissionAuth = function permissionAuth(request, reply, next) {
    let Log = request.logger.bind('permissionAuth')

    try {
      // Return next if this isn't a permission association
      if (!isOwner && !request.path.includes('permission')) {
        return next(null, true)
      }
      let userScope = request.auth.credentials.scope

      // Always allow root
      if (userScope.indexOf('root') > -1) {
        return next(null, true)
      }

      if (isOwner) {
        return internals
          .canAssign(request.params.ownerId, userScope, mongoose, Log)
          .then(function(canAssign) {
            return internals.formatResponse(canAssign, next, Log)
          })
      } else if (request.params.childId) {
        return internals
          .canAssign(request.params.childId, userScope, mongoose, Log)
          .then(function(canAssign) {
            return internals.formatResponse(canAssign, next, Log)
          })
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

        return Q.all(promises).then(function(result) {
          // If any of the checks fail, then an error is returned
          let canAssign =
            result.filter(canAssign => canAssign === false)[0] === undefined

          return internals.formatResponse(canAssign, next, Log)
        })
      }
    } catch (err) {
      Log.error('ERROR:', err)
      return next(null, true)
    }
  }

  permissionAuth.applyPoint = 'onPreHandler'
  return permissionAuth
}
internals.permissionAuth.applyPoint = 'onPreHandler'

internals.canAssign = function(permissionId, userScope, mongoose, Log) {
  const Permission = mongoose.model('permission')

  return RestHapi.find(Permission, permissionId, {}, Log)
    .then(function(result) {
      let assignScope = result.assignScope
      // Check if the user scope intersects (contains values of) the assign scope.
      let canAssign = !!userScope.filter(
        scope => assignScope.indexOf(scope) > -1
      )[0]

      return canAssign
    })
    .catch(function(error) {
      Log.error('ERROR:', error)
      return Boom.badRequest(error)
    })
}

internals.formatResponse = function(canAssign, next, Log) {
  if (canAssign.isBoom) {
    return next(canAssign, false)
  }

  if (canAssign) {
    return next(null, true)
  } else {
    return next(
      Boom.forbidden('Higher role required to assign permission'),
      false
    )
  }
}

module.exports = internals.permissionAuth
