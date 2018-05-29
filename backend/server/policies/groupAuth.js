'use strict'

const Boom = require('boom')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/errorHelper')

const internals = {}

/**
 * Policy to enforce auth for assigning groups.
 * @param mongoose
 * @param isOwner: True if group is the owner model, false otherwise.
 * @returns {groupAuth}
 */
internals.groupAuth = function(mongoose, isOwner) {
  const groupAuth = async function groupAuth(request, h) {
    let Log = request.logger.bind('groupAuth')

    try {
      // Return next if this isn't a group association
      if (!isOwner && !request.path.includes('group')) {
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
      // Multiple groups are being assigned so we need to check each one.
      else {
        const groupIds = request.payload.map(object => object.childId || object)
        let promises = []
        groupIds.forEach(groupId =>
          promises.push(internals.canAssign(groupId, userScope, mongoose, Log))
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

  groupAuth.applyPoint = 'onPreHandler'
  return groupAuth
}
internals.groupAuth.applyPoint = 'onPreHandler'

internals.canAssign = async function(groupId, userScope, mongoose, logger) {
  const Log = logger.bind()
  try {
    const Group = mongoose.model('group')

    let group = await RestHapi.find(
      Group,
      groupId,
      { $embed: ['permissions'], $flatten: true },
      Log
    )
    for (let permission of group.permissions) {
      // Check if the user scope intersects (contains values of) the assign scope.
      if (
        !userScope.filter(
          scope => permission.assignScope.indexOf(scope) > -1
        )[0]
      ) {
        return false
      }
    }
    return true
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
      throw Boom.forbidden('Higher role required to assign group')
    }
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}

module.exports = internals.groupAuth
