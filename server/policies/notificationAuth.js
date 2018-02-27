'use strict';

const Boom = require('boom');
const RestHapi = require('rest-hapi');

const internals = {};

/**
 * Policy to enforce auth for notification updates.
 * @param mongoose
 * @returns {notificationUpdateAuth}
 */
internals.notificationUpdateAuth = function(mongoose) {

  const notificationUpdateAuth = function notificationAuth(request, reply, next) {
    let Log = request.logger.bind("notificationAuth");

    try {
      const Connection = mongoose.model('notification');

      let userId = request.auth.credentials.user._id;

      return RestHapi.find(Connection, request.params._id, {}, Log)
        .then(function (result) {
          // EXPL: Only the primary user and those with root permissions can update the notification
          if (userId === result.primaryUser.toString() || request.auth.credentials.scope.includes('root')) {
            return next(null, true);
          }
          else {
            return next(Boom.forbidden("Not primary user"), false);
          }
        })
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  notificationUpdateAuth.applyPoint = 'onPreHandler';
  return notificationUpdateAuth;
};
internals.notificationUpdateAuth.applyPoint = 'onPreHandler';

module.exports = internals.notificationUpdateAuth

