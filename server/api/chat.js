'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Chalk = require('chalk');
const _ = require('lodash');
const zxcvbn = require('zxcvbn');
const Q = require('q');
const RestHapi = require('rest-hapi');

const Config = require('../../config');
const auditLog = require('../policies/audit-log');

const USER_ROLES = Config.get('/constants/USER_ROLES');
const REQUIRED_PASSWORD_STRENGTH = Config.get('/constants/REQUIRED_PASSWORD_STRENGTH');
const authStrategy = Config.get('/restHapiConfig/authStrategy');

const headersValidation = Joi.object({
    'authorization': Joi.string().required()
}).options({ allowUnknown: true });

module.exports = function (server, mongoose, logger) {

  // Get the conversation between the current user and other users
  (function () {
    const Log = logger.bind(Chalk.magenta("Get Current User Conversation"));

    Log.note("Generating Get Current User Conversation Endpoint for Chat");

    const getConversationHandler = function (request, reply) {
      const Conversation = mongoose.model('conversation');

      // EXPL: The query below searches for the conversation that includes the current user and the users provided
      // in the request query ONLY.
      const query = { $where: { $and: [{ users: { $elemMatch: { $eq: request.auth.credentials.user._id } } }] } }

      const users = _.isArray(request.query.users) ? request.query.users : [request.query.users]

      if (users.includes(request.auth.credentials.user._id.toString())) {
        return reply(Boom.badRequest('No chatting with yourself.'))
      }

      users.forEach(function(userId) {
        query.$where.$and.push({ users: { $elemMatch: { $eq: userId } } })
      })

      query.$where.$and.push({ users: { $size: users.length + 1 } })

      query.$embed = ['messages']

      return RestHapi.list(Conversation, query, Log)
        .then(function(result) {
          Log.debug("RESUTL:", result)
          // EXPL: if the conversation doesn't exist, create it
          if (!result.docs[0]) {
            users.push(request.auth.credentials.user._id)
            return RestHapi.create(Conversation, { users }, Log)
              .then(function(result) {
                return reply(result)
              })
          }
          else {
            return reply(result.docs[0])
          }
        })
        .catch(function (error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });
    };

    server.subscription('/conversation/{_id}');

    server.route({
      method: 'GET',
      path: '/conversation/my',
      config: {
        handler: getConversationHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Get the conversation between the current user and other specified users.',
        tags: ['api', 'Chat', 'Get Conversation'],
        validate: {
          headers: headersValidation,
          query: {
            users: Joi.alternatives(Joi.array().items(RestHapi.joiHelper.joiObjectId()), RestHapi.joiHelper.joiObjectId()).required()
          }
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

  // Chat
  (function () {
    const Log = logger.bind(Chalk.magenta("Post Message"));

    Log.note("Generating Post Message endpoint for Chat");

    const postMessageHandler = function (request, reply) {
      const Message = mongoose.model('message');

      // Log.debug("AUTH:", request.auth)

      const payload = {
        text: request.payload.text,
        conversation: request.params.conversationId,
        user: request.auth.credentials.user._id
      }

      return RestHapi.create(Message, payload, Log)
        .then(function (result) {
          Log.debug("RESULT:", result);
          server.publish('/conversation/' + payload.conversation, result);
          return reply('published');
        })
        .catch(function (error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });
    };

    // TODO: Authorize correct users for posting to a conversation
    server.route({
      method: 'POST',
      path: '/message/{conversationId}',
      config: {
        id: 'message',
        handler: postMessageHandler,
        // auth: {
        //   strategy: authStrategy,
        //   scope: _.values(USER_ROLES)
        // },
        // auth: false,
        description: 'Post a message to a conversation.',
        tags: ['api', 'Chat', 'Post Message'],
        validate: {
          // headers: headersValidation,
          params: {
            conversationId: RestHapi.joiHelper.joiObjectId()
          },
          payload: {
            text: Joi.string().required()
          }
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



    server.route({
      method: 'GET',
      path: '/h',
      config: {
        id: 'hello',
        handler: function (request, reply) {
          return reply('Welcome to Chat!');
        }
      }
    });
  }());

};
