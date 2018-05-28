'use strict'

const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/errorHelper')

module.exports = function(mongoose) {
  var modelName = 'message'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
      text: {
        type: Types.String,
        required: true
      },
      conversation: {
        type: Types.ObjectId,
        ref: 'conversation',
        allowOnUpdate: false,
        required: true
      },
      user: {
        type: Types.ObjectId,
        ref: 'user',
        allowOnUpdate: false,
        required: true
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      allowCreate: false,
      allowUpdate: false,
      allowAssociate: false,
      policies: {},
      associations: {
        conversation: {
          type: 'MANY_ONE',
          model: 'user'
        }
      },
      create: {
        post: async function(document, request, result, logger) {
          const Log = logger.bind()
          try {
            const Conversation = mongoose.model('conversation')
            // Every new message is set as the latest message in the conversation
            await RestHapi.update(
              Conversation,
              document.conversation,
              { lastMessage: document._id },
              Log
            )
            return document
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      }
    }
  }

  return Schema
}
