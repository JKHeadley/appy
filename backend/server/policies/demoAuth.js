'use strict';

const Boom = require('boom');

const internals = {};

/**
 * Policy to restrict certain action for the live demo (such as super admins deleting users).
 * @param request
 * @param reply
 * @param next
 * @returns {*}
 */
internals.demoAuth = function(request, reply, next) {

  let Log = request.logger.bind("demoAuth");

  try {
    return next(Boom.forbidden("Action not allowed for demo"), false);
  }
  catch (err) {
    Log.error("ERROR:", err);
    return next(null, true);
  }

};
internals.demoAuth.applyPoint = 'onPreHandler';

module.exports = {
  demoAuth: internals.demoAuth,
}

