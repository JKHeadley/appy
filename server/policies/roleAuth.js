'use strict';

const Boom = require('boom');
const RestHapi = require('rest-hapi');
const Q = require('q');

const internals = {};

/**
 * Policy to enforce role rank. A user should only be able to update users that have a role with a lower rank.
 * @param mongoose
 * @param userIdParam: The url parameter that contains the _id of the user to be affected. Should be "child" if the user
 * is a child association.
 * @returns {rankAuth}
 */
internals.rankAuth = function(mongoose, userIdParam) {

  const rankAuth = function rankAuth(request, reply, next) {
    let Log = request.logger.bind("rankAuth");

    try {
      // EXPL: Return next if this isn't a user association
      if (!request.path.includes("user")) {
        return next(null, true)
      }
      if (userIdParam === "child") {
        if (request.params.childId) {
          return internals.canEdit(request.params.childId, request, mongoose, Log)
            .then(function(canEdit) {
              return internals.formatResponse(canEdit, next, Log);
            })
        }
        // EXPL: Multiple users are being updated.
        else {
          const userIds = request.payload.map(object => object.childId || object)
          let promises = [];
          userIds.forEach(userId => promises.push(internals.canEdit(userId, request, mongoose, Log)))

          return Q.all(promises)
            .then(function(result) {
              // EXPL: If any of the checks fail, then an error is returned
              let canEdit = result.filter(canEdit => canEdit === false)[0] === undefined

              return internals.formatResponse(canEdit, next, Log);
            })
        }
      } else {
        return internals.canEdit(request.params[userIdParam], request, mongoose, Log)
          .then(function(canEdit) {
            return internals.formatResponse(canEdit, next, Log);
          })
      }
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  rankAuth.applyPoint = 'onPreHandler';
  return rankAuth;
};
internals.rankAuth.applyPoint = 'onPreHandler';

/**
 * Policy to restrict users from promoting other users to a rank higher than their own.
 * @param mongoose
 * @returns {promoteAuth}
 */
internals.promoteAuth = function(mongoose) {

  const promoteAuth = function promoteAuth(request, reply, next) {
    let Log = request.logger.bind("promoteAuth");

    try {
      const Role = mongoose.model("role");

      if (request.payload.role) {
        return RestHapi.find(Role, request.payload.role, {}, Log)
          .then(function (result) {
            let updatedRank = result.rank;
            let currentRank = request.auth.credentials.user.roleRank;

            if (updatedRank < currentRank) {
              return next(Boom.forbidden("Can't promote user to a higher role than yours"), false);
            }
            else {
              return next(null, true);
            }
          })
      }
      else {
        return next(null, true);
      }
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  promoteAuth.applyPoint = 'onPreHandler';
  return promoteAuth;
};
internals.promoteAuth.applyPoint = 'onPreHandler';

internals.canEdit = function(userId, request, mongoose, Log) {
  const User = mongoose.model('user');

  return RestHapi.find(User, userId, {}, Log)
    .then(function(result) {
      const currentUserRank = request.auth.credentials.user.roleRank;
      const affectedUserRank = result.roleRank;

      return currentUserRank < affectedUserRank
    })
    .catch(function(error) {
      Log.error("ERROR:", error)
      return Boom.badRequest(error)
    })
}

internals.formatResponse = function(canEdit, next, Log) {
  if (canEdit.isBoom) {
    return next(canEdit, false);
  }

  if (canEdit) {
    return next(null, true);
  }
  else {
    return next(Boom.forbidden("Can only update users with a lower role"), false);
  }
}

module.exports = {
  rankAuth: internals.rankAuth,
  promoteAuth: internals.promoteAuth
}

