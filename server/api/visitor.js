'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Chalk = require('chalk');
const RestHapi = require('rest-hapi');

const iplocation = require('iplocation');
const useragent = require('useragent');
const faker = require('faker')

const Config = require('../../config');
const auditLog = require('../policies/audit-log');

const authStrategy = Config.get('/restHapiConfig/authStrategy');

module.exports = function (server, mongoose, logger) {

  // Record Visitor Endpoint
  (function() {
    const Visitor = mongoose.model('visitor');
    const Log = logger.bind(Chalk.magenta("Visitor"));

    Log.note("Generating Record Visitor endpoint");

    const recordVisitorHandler = function (request, reply) {
      iplocation(server.methods.getIP(request))
        .then(function(result) {
          const agent = useragent.parse(request.headers['user-agent']);

          const visitor = Object.assign(result, {browser: agent.family});

          return RestHapi.create(Visitor, visitor, Log)
        })
        .then(function(result) {
          return reply();
        })
        .catch(function(error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });
    };

    server.route({
      method: 'POST',
      path: '/visitor',
      config: {
        handler: recordVisitorHandler,
        auth: null,
        description: 'Create a new visitor record.',
        tags: ['api', 'Visitor'],
        validate: {
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          }
        }
      }
    });
  }());

};
