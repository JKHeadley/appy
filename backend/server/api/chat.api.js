'use strict'

const Joi = require('joi')
const Boom = require('boom')
const Chalk = require('chalk')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/error-helper')

const Config = require('../../config')

const CHAT_TYPES = Config.get('/constants/CHAT_TYPES')
const authStrategy = Config.get('/restHapiConfig/authStrategy')

const headersValidation = Joi.object({
  authorization: Joi.string().required()
}).options({ allowUnknown: true })

module.exports = function(server, mongoose, logger) {
  // Create the chat subscription
  ;(function() {
    // const Log = logger.bind(Chalk.magenta('Chat Subscription'))

    server.subscription('/chat/{userId}', {
      filter: function(path, message, options) {
        return true
      },
      auth: {
        scope: ['root', 'receiveChatMessages', '!-receiveChatMessages'],
        entity: 'user',
        index: true
      },
      onSubscribe: function(socket, path, params) {}
    })
  })(
    // Mark conversation as read
    (function() {
      const Log = logger.bind(Chalk.magenta('Mark Conversation As Read'))

      Log.note('Generating Mark Conversation As Read Endpoint for Chat')

      const markAsReadHandler = async function(request, h) {
        try {
          const Conversation = mongoose.model('conversation')
          const User = mongoose.model('user')

          return await RestHapi.addOne(
            Conversation,
            request.params._id,
            User,
            request.auth.credentials.user._id,
            'userData',
            { hasRead: true }
          )
        } catch (err) {
          errorHelper.handleError(err, Log)
        }
      }

      server.route({
        method: 'PUT',
        path: '/conversation/{_id}/read',
        config: {
          handler: markAsReadHandler,
          auth: {
            strategy: authStrategy,
            scope: [
              'root',
              'markConversationAsRead',
              '!-markConversationAsRead'
            ]
          },
          description: 'Mark the conversation as read for the current user.',
          tags: ['api', 'Chat', 'Mark as read'],
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
            }
          }
        }
      })
    })()
  )

  // Mark conversation as unread
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Mark Conversation As Unread'))

    Log.note('Generating Mark Conversation As Unread Endpoint for Chat')

    const markAsUnreadHandler = async function(request, h) {
      try {
        const Conversation = mongoose.model('conversation')
        const User = mongoose.model('user')

        return await RestHapi.addOne(
          Conversation,
          request.params._id,
          User,
          request.auth.credentials.user._id,
          'userData',
          { hasRead: false }
        )
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'PUT',
      path: '/conversation/{_id}/unread',
      config: {
        handler: markAsUnreadHandler,
        auth: {
          strategy: authStrategy,
          scope: [
            'root',
            'markConversationAsUnread',
            '!-markConversationAsUnread'
          ]
        },
        description: 'Mark the conversation as unread for the current user.',
        tags: ['api', 'Chat', 'Mark as unread'],
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
          }
        }
      }
    })
  })()

  // Get the current user's conversations
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Get Current User Conversations'))

    Log.note('Generating Get Current User Conversations Endpoint for Chat')

    const getConversationsHandler = async function(request, h) {
      try {
        const Conversation = mongoose.model('conversation')
        const query = {
          $where: {
            users: { $elemMatch: { $eq: request.auth.credentials.user._id } }
          }
        }

        query.$embed = ['users', 'lastMessage.user', 'userData']
        query.$sort = ['-updatedAt']

        let result = await RestHapi.list(Conversation, query, Log)

        result.docs.forEach(function(conversation) {
          formatConversation(request, conversation)
        })

        return result
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'GET',
      path: '/conversations/my',
      config: {
        handler: getConversationsHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'readMyConversations', '!-readMyConversations']
        },
        description: "Get the current user's conversations.",
        tags: ['api', 'Chat', 'Get Conversations'],
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
          }
        }
      }
    })
  })()

  // Get the conversation between the current user and other users
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Get Current User Conversation'))

    Log.note('Generating Get Current User Conversation Endpoint for Chat')

    const getConversationHandler = async function(request, h) {
      try {
        const Conversation = mongoose.model('conversation')
        const User = mongoose.model('user')

        let promise = {}
        let conversation = {}
        let newConversation = false

        const query = {
          $embed: ['messages.user', 'users', 'userData', 'lastMessage.user']
        }

        // Find the conversation by _id if provided
        if (request.query.conversation) {
          promise = RestHapi.find(
            Conversation,
            request.query.conversation,
            query,
            Log
          )
        } else if (request.query.user) {
          if (
            request.query.user === request.auth.credentials.user._id.toString()
          ) {
            throw Boom.badRequest('No chatting with yourself.')
          }

          // The query below searches for the direct chat conversation between the current user and the user provided
          query.$where = {
            $and: [
              {
                users: {
                  $elemMatch: { $eq: request.auth.credentials.user._id }
                }
              },
              { users: { $elemMatch: { $eq: request.query.user } } },
              { chatType: { $eq: CHAT_TYPES.DIRECT } }
            ]
          }

          promise = RestHapi.list(Conversation, query, Log)
        } else {
          throw Boom.badRequest(
            'Must provide either conversation or user query params.'
          )
        }

        let result = await promise

        if (request.query.conversation) {
          let me = result.users.find(function(user) {
            return (
              user._id.toString() ===
              request.auth.credentials.user._id.toString()
            )
          })
          if (!me) {
            throw Boom.badRequest(
              'Current user is not part of this conversation.'
            )
          }
          return result
        } else {
          // If the conversation doesn't exist, create it
          if (!result.docs[0]) {
            newConversation = true
            let promises = []
            let users = [request.auth.credentials.user._id, request.query.user]
            promises.push(
              RestHapi.create(
                Conversation,
                { users, chatType: CHAT_TYPES.DIRECT },
                Log
              )
            )
            promises.push(
              RestHapi.list(
                User,
                {
                  _id: users,
                  $select: ['_id', 'firstName', 'lastName', 'profileImageUrl']
                },
                Log
              )
            )
            result = await Promise.all(promises)
          } else {
            result = result.docs[0]
          }
        }

        if (newConversation) {
          // Add the user docs to the new conversation object
          conversation = result[0]
          conversation.users = result[1].docs
          result = conversation
        }

        conversation = result
        if (newConversation) {
          // Associate the user data with the new conversation
          let users = conversation.users.map(function(user) {
            return user._id
          })
          conversation.hasRead = false
          await RestHapi.addMany(
            Conversation,
            conversation._id,
            User,
            'userData',
            users,
            Log
          )
        }

        formatConversation(request, conversation)
        return conversation
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'GET',
      path: '/conversation/my',
      config: {
        handler: getConversationHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'readMyConversations', '!-readMyConversations']
        },
        description:
          'Get the conversation between the current user and other specified users.',
        tags: ['api', 'Chat', 'Get Conversation'],
        validate: {
          headers: headersValidation,
          query: {
            user: RestHapi.joiHelper.joiObjectId(),
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
    })
  })()

  // Post chat messages
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Post Message'))

    Log.note('Generating Post Message endpoint for Chat')

    const postMessageHandler = async function(request, h) {
      try {
        const Message = mongoose.model('message')
        const Conversation = mongoose.model('conversation')

        const promises = []

        const payload = {
          text: request.payload.text,
          conversation: request.params.conversationId,
          user: request.auth.credentials.user._id
        }

        promises.push(
          RestHapi.find(Conversation, payload.conversation, {}, Log)
        )
        promises.push(RestHapi.create(Message, payload, Log))

        let result = await Promise.all(promises)

        let conversation = result[0]
        let message = result[1]
        Log.debug('MESSAGE:', message)
        conversation.users.forEach(function(userId) {
          server.publish('/chat/' + userId, message)
        })
        return 'published'
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    // TODO: Authorize correct users for posting to a conversation
    server.route({
      method: 'POST',
      path: '/message/{conversationId}',
      config: {
        id: 'message',
        handler: postMessageHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'postChatMessage', '!-postChatMessage']
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
    })
  })()

  const formatConversation = function(request, conversation) {
    // Remove the current user from the list of users since it's implied
    conversation.users = conversation.users.filter(function(user) {
      return (
        user._id.toString() !== request.auth.credentials.user._id.toString()
      )
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
      conversation.lastMessage.me =
        conversation.lastMessage.user._id.toString() ===
        request.auth.credentials.user._id.toString()
    }
    if (conversation.userData) {
      let currentUserData = conversation.userData.find(function(userData) {
        return (
          userData.user._id.toString() ===
          request.auth.credentials.user._id.toString()
        )
      })

      conversation.hasRead = currentUserData ? currentUserData.hasRead : false
      delete conversation.userData
    } else {
      conversation.hasRead = false
    }

    return conversation
  }
}
