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

  // Create the chat subscription
  (function () {
    const Log = logger.bind(Chalk.magenta("Chat Subscription"));

    server.subscription('/chat/{userId}', {
      filter: function (path, message, options, next) {
        next(true);
      },
      auth: {
        scope: _.values(USER_ROLES),
        entity: 'user',
        index: true
      },
      onSubscribe: function (socket, path, params, next) {
        next();
      }
    });
  })

  // Mark conversation as read
  (function () {
    const Log = logger.bind(Chalk.magenta("Mark Conversation As Read"));

    Log.note("Generating Mark Conversation As Read Endpoint for Chat");

    const markAsReadHandler = function (request, reply) {
      const Conversation = mongoose.model('conversation');
      const User = mongoose.model('user');

      return RestHapi.addOne(Conversation, request.params._id, User, request.auth.credentials.user._id, 'userData', { hasRead: true })
        .then(function (result) {
          return reply(result)
        })
        .catch(function (error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });
    };

    server.route({
      method: 'PUT',
      path: '/conversation/{_id}/read',
      config: {
        handler: markAsReadHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Mark the conversation as read for the current user.',
        tags: ['api', 'Chat', 'Mark as read'],
        validate: {
          headers: headersValidation,
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

  // Mark conversation as unread
  (function () {
    const Log = logger.bind(Chalk.magenta("Mark Conversation As Unread"));

    Log.note("Generating Mark Conversation As Unread Endpoint for Chat");

    const markAsUnreadHandler = function (request, reply) {
      const Conversation = mongoose.model('conversation');
      const User = mongoose.model('user');

      return RestHapi.addOne(Conversation, request.params._id, User, request.auth.credentials.user._id, 'userData', { hasRead: false })
        .then(function (result) {
          return reply(result)
        })
        .catch(function (error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });
    };

    server.route({
      method: 'PUT',
      path: '/conversation/{_id}/unread',
      config: {
        handler: markAsUnreadHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Mark the conversation as unread for the current user.',
        tags: ['api', 'Chat', 'Mark as unread'],
        validate: {
          headers: headersValidation,
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

  // Get the current user's conversations
  (function () {
    const Log = logger.bind(Chalk.magenta("Get Current User Conversations"));

    Log.note("Generating Get Current User Conversations Endpoint for Chat");

    const getConversationsHandler = function (request, reply) {
      const Conversation = mongoose.model('conversation');

      // EXPL: The query below searches for the conversation that includes the current user and the users provided
      // in the request query ONLY.
      const query = { $where: { users: { $elemMatch: { $eq: request.auth.credentials.user._id } } } }

      query.$embed = ['users', 'lastMessage.user', 'userData'];
      query.$sort = ['-updatedAt'];

      return RestHapi.list(Conversation, query, Log)
        .then(function (result) {
          result.docs.forEach(function(conversation) {
            formatConversation(request, conversation);
          })
          return reply(result)
        })
        .catch(function (error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });
    };

    server.route({
      method: 'GET',
      path: '/conversations/my',
      config: {
        handler: getConversationsHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Get the current user\'s conversations.',
        tags: ['api', 'Chat', 'Get Conversations'],
        validate: {
          headers: headersValidation,
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

  // Get the conversation between the current user and other users
  (function () {
    const Log = logger.bind(Chalk.magenta("Get Current User Conversation"));

    Log.note("Generating Get Current User Conversation Endpoint for Chat");

    const getConversationHandler = function (request, reply) {
      const Conversation = mongoose.model('conversation');
      const User = mongoose.model('user');

      let promise = {};
      let conversation = {};
      let newConversation = false;

      let users = [];

      const query = {
        $embed: ['messages.user', 'users', 'userData', 'lastMessage.user']
      };

      if (request.query.conversation) {
        promise = RestHapi.find(Conversation, request.query.conversation, query , Log);
      }
      else if (request.query.users) {
        // EXPL: The query below searches for the conversation that includes the current user and the users provided
        // in the request query ONLY.
        query.$where = { $and: [{ users: { $elemMatch: { $eq: request.auth.credentials.user._id } } }] };

        users = _.isArray(request.query.users) ? request.query.users : [request.query.users]

        if (users.includes(request.auth.credentials.user._id.toString())) {
          return reply(Boom.badRequest('No chatting with yourself.'))
        }

        users.forEach(function(userId) {
          query.$where.$and.push({ users: { $elemMatch: { $eq: userId } } })
        })

        query.$where.$and.push({ users: { $size: users.length + 1 } })

        promise = RestHapi.list(Conversation, query, Log)
      }
      else {
        return reply(Boom.badRequest('Must provide either conversation or users query params.'));
      }

      return promise
        .then(function(result) {
          if (request.query.conversation) {
            let me = result.users.find(function (user) {
              return user._id.toString() === request.auth.credentials.user._id.toString()
            })
            if (!me) {
              return reply(Boom.badRequest('Current user is not part of this conversation.'));
            }
            return result
          }
          else {
            // EXPL: If the conversation doesn't exist, create it
            if (!result.docs[0]) {
              newConversation = true;
              let promises = [];
              users.push(request.auth.credentials.user._id);
              promises.push(RestHapi.create(Conversation, {users}, Log));
              promises.push(RestHapi.list(User, { _id: users, $select: ['_id', 'firstName', 'lastName', 'profileImageUrl'] }, Log));
              return Q.all(promises);
            }
            else {
              return result.docs[0];
            }
          }
        })
        .then(function(result) {
          if (newConversation) {
            // EXPL: Add the user docs to the new conversation object
            conversation = result[0];
            conversation.users = result[1].docs;
            return conversation;
          }
          else {
            return result;
          }
        })
        .then(function(result) {
          conversation = result;
          if (newConversation) {
            // EXPL: Associate the user data with the new conversation
            let users = conversation.users.map(function(user) { return user._id })
            conversation.hasRead = false;
            return RestHapi.addMany(Conversation, conversation._id, User, 'userData', users, Log)
          }
        })
        .then(function() {
          formatConversation(request, conversation);
          return reply(conversation)
        })
        .catch(function (error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });
    };

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
            users: Joi.alternatives(Joi.array().items(RestHapi.joiHelper.joiObjectId()), RestHapi.joiHelper.joiObjectId()),
            conversation: RestHapi.joiHelper.joiObjectId()
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

  // Post chat messages
  (function () {
    const Log = logger.bind(Chalk.magenta("Post Message"));

    Log.note("Generating Post Message endpoint for Chat");

    const postMessageHandler = function (request, reply) {
      const Message = mongoose.model('message');
      const Conversation = mongoose.model('conversation');
      const User = mongoose.model('user');

      const promises = [];

      const payload = {
        text: request.payload.text,
        conversation: request.params.conversationId,
        user: request.auth.credentials.user._id
      }

      promises.push(RestHapi.find(Conversation, payload.conversation, {}, Log));
      promises.push(RestHapi.getAll(Conversation, payload.conversation, User, 'users', { $select: ['_id', 'firstName', 'lastName', 'profileImageUrl'] }, Log));
      promises.push(RestHapi.create(Message, payload, Log));

      return Q.all(promises)
        .then(function (result) {
          let conversation = result[0];
          let users = result[1].docs;
          let message = result[2];
          conversation.users = users;
          message.conversation = conversation;
          Log.debug("MESSAGE:", message);
          users.forEach(function(user) {
            server.publish('/chat/' + user._id.toString(), message);
          })
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
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
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
  }());

  const formatConversation = function (request, conversation) {

    // EXPL: Remove the current user from the list of users since it's implied
    conversation.users = conversation.users.filter(function(user) {
      return user._id.toString() !== request.auth.credentials.user._id.toString()
    })
    conversation.users = conversation.users.map(function(user) {
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      }
    })
    if (conversation.lastMessage) {
      conversation.lastMessage.user = {
        _id: conversation.lastMessage.user._id,
        firstName: conversation.lastMessage.user.firstName,
        lastName: conversation.lastMessage.user.lastName,
        profileImageUrl: conversation.lastMessage.user.profileImageUrl
      }
    }
    if (conversation.userData) {
      let currentUserData = conversation.userData.find(function(userData) {
        return userData.user._id.toString() === request.auth.credentials.user._id.toString()
      })

      conversation.hasRead = currentUserData ? currentUserData.hasRead : false;
      delete conversation.userData;
    }
    else {
      conversation.hasRead = false;
    }

    return conversation
  }

};
