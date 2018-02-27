'use strict';

const Boom = require('boom');
const RestHapi = require('rest-hapi');
const Q = require('q');

const internals = {};

/**
 * Policy to enforce auth for assigning permissions.
 * @param mongoose
 * @param isOwner: True if permission is the owner model, false otherwise.
 * @returns {permissionAuth}
 */
internals.permissionAuth = function(mongoose, isOwner) {

  const permissionAuth = function permissionAuth(request, reply, next) {
    let Log = request.logger.bind("permissionAuth");

    try {
      Log.debug("PATH:", request.path);
      // EXPL: Return next if this isn't a permission association
      if (!isOwner && !request.path.includes("permission")) {
        Log.debug("NOT PERMISSION")
        return next(null, true)
      }
      let userScope = request.auth.credentials.scope;
      Log.debug("USER SCOPE", userScope)

      // EXPL: Always allow root
      if (userScope.indexOf('root') > -1) {
        Log.debug("ROOT SCOPE:", userScope.indexOf('root'))
        return next(null, true);
      }

      if (isOwner) {
        return internals.canAssign(request.params.ownerId, userScope, mongoose, Log)
          .then(function(canAssign) {
            if (canAssign) {
              return next(null, true);
            }
            else {
              return next(Boom.forbidden("Insufficient scope to assign permission."), false);
            }
          })
      }
      else if (request.params.childId) {
        return internals.canAssign(request.params.childId, userScope, mongoose, Log)
          .then(function(canAssign) {
            if (canAssign) {
              return next(null, true);
            }
            else {
              return next(Boom.forbidden("Insufficient scope to assign permission."), false);
            }
          })
      }
      // EXPL: Multiple permissions are being assigned so we need to check each one.
      else {
        const permissionIds = request.payload.map(object => object.childId || object)
        let promises = [];
        permissionIds.forEach(permissionId => promises.push(internals.canAssign(permissionId, userScope, mongoose, Log)))

        return Q.all(promises)
          .then(function(result) {

            Log.debug("MULTIPLE CHECKS:", result);
            // EXPL: If any of the checks fail, then an error is returned
            let canAssign = result.filter(canAssign => canAssign === false)[0] === undefined
            Log.debug("canAssign:", canAssign);

            if (canAssign) {
              return next(null, true);
            }
            else {
              return next(Boom.forbidden("Insufficient scope to assign permission."), false);
            }
          })
      }
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  permissionAuth.applyPoint = 'onPreHandler';
  return permissionAuth;
};
internals.permissionAuth.applyPoint = 'onPreHandler';

internals.canAssign = function(permissionId, userScope, mongoose, Log) {
  const Permission = mongoose.model('permission');

  return RestHapi.find(Permission, permissionId, {}, Log)
    .then(function (result) {
      let assignScope = result.assignScope;
      Log.debug("ASSIGN SCOPE:", assignScope)
      // EXPL: Check if the user scope intersects (contains values of) the assign scope.
      let canAssign = !!userScope.filter(scope => assignScope.indexOf(scope) > -1)[0]

      return canAssign
    })
}

module.exports = internals.permissionAuth

