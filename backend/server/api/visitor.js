'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Chalk = require('chalk');

const iplocation = require('iplocation');
const useragent = require('useragent');
const faker = require('faker')

const Config = require('../../config');
const auditLog = require('../policies/audit-log');

const authStrategy = Config.get('/restHapiConfig/authStrategy');

module.exports = function (server, mongoose, logger) {

  // Record Visitor Endpoint
  (function() {
    const Log = logger.bind(Chalk.magenta("Visitor"));

    Log.note("Generating Record Visitor endpoint");

    const recordVisitorHandler = function (request, reply) {
      iplocation(faker.internet.ip())
        .then(function(result) {
          const ipAddress = request.info.remoteAddress;
          const agent = useragent.parse(request.headers['user-agent']);
          Log.debug("IP:", ipAddress);
          Log.debug("DATA:", result)
          Log.debug("agent:", agent.family)

          Log.debug("TEST2");

          return reply();
        })
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
          },
          'policies': [auditLog(mongoose, {}, Log)]
        }
      }
    });
  }());

};
