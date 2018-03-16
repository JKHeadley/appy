'use strict';

const Boom = require('boom');
const RestHapi = require('rest-hapi');
const Q = require('q');

const internals = {};

/**
 * Policy to enforce auth for assigning groups.
 * @param mongoose
 * @param isOwner: True if group is the owner model, false otherwise.
 * @returns {groupAuth}
 */
internals.groupAuth = function(mongoose, isOwner) {

  const groupAuth = function groupAuth(request, reply, next) {
    let Log = request.logger.bind("groupAuth");

    try {
      // EXPL: Return next if this isn't a group association
      if (!isOwner && !request.path.includes("group")) {
        return next(null, true)
      }
      let userScope = request.auth.credentials.scope;

      // EXPL: Always allow root
      if (userScope.indexOf('root') > -1) {
        return next(null, true);
      }

      if (isOwner) {
        return internals.canAssign(request.params.ownerId, userScope, mongoose, Log)
          .then(function(canAssign) {
            return internals.formatResponse(canAssign, next, Log);
          })
      }
      else if (request.params.childId) {
        return internals.canAssign(request.params.childId, userScope, mongoose, Log)
          .then(function(canAssign) {
            return internals.formatResponse(canAssign, next, Log);
          })
      }
      // EXPL: Multiple groups are being assigned so we need to check each one.
      else {
        const groupIds = request.payload.map(object => object.childId || object)
        let promises = [];
        groupIds.forEach(groupId => promises.push(internals.canAssign(groupId, userScope, mongoose, Log)))

        return Q.all(promises)
          .then(function(result) {
            // EXPL: If any of the checks fail, then an error is returned
            let canAssign = result.filter(canAssign => canAssign === false)[0] === undefined

            return internals.formatResponse(canAssign, next, Log);
          })
      }
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  groupAuth.applyPoint = 'onPreHandler';
  return groupAuth;
};
internals.groupAuth.applyPoint = 'onPreHandler';

internals.canAssign = function(groupId, userScope, mongoose, Log) {
  const Group = mongoose.model('group');

  return RestHapi.find(Group, groupId, { $embed: ['permissions'], $flatten: true }, Log)
    .then(function (result) {
      for (let permission of result.permissions) {
        // EXPL: Check if the user scope intersects (contains values of) the assign scope.
        if (!userScope.filter(scope => permission.assignScope.indexOf(scope) > -1)[0]) {
          return false
        }
      }
      return true
    })
    .catch(function(error) {
      Log.error("ERROR:", error)
      return Boom.badRequest(error)
    })
}

internals.formatResponse = function(canAssign, next, Log) {
  if (canAssign.isBoom) {
    return next(canAssign, false);
  }

  if (canAssign) {
    return next(null, true);
  }
  else {
    return next(Boom.forbidden("Higher role required to assign group"), false);
  }
}

module.exports = internals.groupAuth

