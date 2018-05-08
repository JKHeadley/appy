'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Chalk = require('chalk');

const Config = require('../config/config');
const auditLog = require('../policies/audit-log');

const authStrategy = Config.get('/restHapiConfig/authStrategy');

module.exports = function (server, mongoose, logger) {

  // Logout Endpoint
  (function() {
    const Log = logger.bind(Chalk.magenta("Logout"));
    const Session = mongoose.model('session');

    const headersValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({ allowUnknown: true });

    Log.note("Generating Logout endpoint");

    const logoutHandler = function (request, reply) {

      const credentials = request.auth.credentials || { session: null };
      const session = credentials.session;

      if (session) {
        Session.findByIdAndRemove(session._id)
          .then(function (sessionDoc) {

            if (!sessionDoc) {
              return reply(Boom.notFound('Session not found'));
            }

            return reply({ message: 'Success' });
          })
          .catch(function (error) {
            Log.error(error);
            return reply(RestHapi.errorHelper.formatResponse(error));
          });
      }
      else {
        return reply(Boom.badRequest("Requires refresh token for auth header"));
      }
    };

    server.route({
      method: 'DELETE',
      path: '/logout',
      config: {
        handler: logoutHandler,
        auth: authStrategy,
        description: 'User logout.',
        tags: ['api', 'Logout'],
        validate: {
          headers: headersValidation
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          'policies': [auditLog(mongoose, {}, Log)]
        }
      }
    });
  }());

};
