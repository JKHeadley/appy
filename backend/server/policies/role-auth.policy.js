'use strict'

const Boom = require('boom')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/error-helper')

const internals = {}

/**
 * Policy to enforce role rank. A user should only be able to update users that have a role with a lower rank.
 * @param mongoose
 * @param userIdParam: The url parameter that contains the _id of the user to be affected. Should be "child" if the user
 * is a child association.
 * @returns {rankAuth}
 */
internals.rankAuth = function(mongoose, userIdParam) {
  const rankAuth = async function rankAuth(request, h) {
    const Log = request.logger.bind('rankAuth')

    try {
      // Continue if this isn't a user association
      if (!request.path.includes('user')) {
        return h.continue
      }
      if (userIdParam === 'child') {
        if (request.params.childId) {
          let canEdit = await internals.canEdit(
            request.params.childId,
            request,
            mongoose,
            Log
          )
          return internals.formatResponse(canEdit, h, Log)
        }
        // Multiple users are being updated.
        else {
          const userIds = request.payload.map(
            object => object.childId || object
          )
          let promises = []
          userIds.forEach(userId =>
            promises.push(internals.canEdit(userId, request, mongoose, Log))
          )

          let result = await Promise.all(promises)
          // If any of the checks fail, then an error is returned
          let canEdit =
            result.filter(canEdit => canEdit === false)[0] === undefined

          return internals.formatResponse(canEdit, h, Log)
        }
      } else {
        let canEdit = await internals.canEdit(
          request.params[userIdParam],
          request,
          mongoose,
          Log
        )
        return internals.formatResponse(canEdit, h, Log)
      }
    } catch (err) {
      errorHelper.handleError(err, Log)
    }
  }

  rankAuth.applyPoint = 'onPreHandler'
  return rankAuth
}
internals.rankAuth.applyPoint = 'onPreHandler'

/**
 * Policy to restrict users from promoting other users to a rank higher than their own.
 * @param mongoose
 * @returns {promoteAuth}
 */
internals.promoteAuth = function(mongoose) {
  const promoteAuth = async function promoteAuth(request, h) {
    const Log = request.logger.bind('promoteAuth')

    try {
      const Role = mongoose.model('role')

      if (request.payload.role) {
        let role = await RestHapi.find(Role, request.payload.role, {}, Log)
        let updatedRank = role.rank
        let currentRank = request.auth.credentials.user.roleRank

        if (updatedRank < currentRank) {
          throw Boom.forbidden("Can't promote user to a higher role than yours")
        } else {
          return h.continue
        }
      } else {
        return h.continue
      }
    } catch (err) {
      errorHelper.handleError(err, Log)
    }
  }

  promoteAuth.applyPoint = 'onPreHandler'
  return promoteAuth
}
internals.promoteAuth.applyPoint = 'onPreHandler'

internals.canEdit = async function(userId, request, mongoose, logger) {
  const Log = logger.bind()
  try {
    const User = mongoose.model('user')

    let user = await RestHapi.find(User, userId, {}, Log)
    const currentUserRank = request.auth.credentials.user.roleRank
    const affectedUserRank = user.roleRank

    return currentUserRank < affectedUserRank
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}

internals.formatResponse = function(canEdit, h, logger) {
  const Log = logger.bind()
  try {
    if (canEdit.isBoom) {
      throw canEdit
    }

    if (canEdit) {
      return h.continue
    } else {
      throw Boom.forbidden('Can only update users with a lower role')
    }
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}

module.exports = {
  rankAuth: internals.rankAuth,
  promoteAuth: internals.promoteAuth
}
