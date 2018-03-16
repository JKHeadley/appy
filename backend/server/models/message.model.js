'use strict';

const RestHapi = require('rest-hapi');

const connectionUpdateAuth = require('../policies/connectionAuth').connectionUpdateAuth;

module.exports = function (mongoose) {
  var modelName = "message";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    text: {
      type: Types.String,
      required: true
    },
    conversation: {
      type: Types.ObjectId,
      ref: "conversation",
      allowOnUpdate: false,
      required: true
    },
    user: {
      type: Types.ObjectId,
      ref: "user",
      allowOnUpdate: false,
      required: true
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      allowCreate: false,
      allowUpdate: false,
      allowAssociate: false,
      policies: {
      },
      associations: {
        conversation: {
          type: "MANY_ONE",
          model: "user",
        }
      },
      create: {
        post: function(document, request, result, Log) {
          const Conversation = mongoose.model('conversation');
          // EXPL: Every new message is set as the latest message in the conversation
          return RestHapi.update(Conversation, document.conversation, { lastMessage: document._id }, Log)
            .then(function() {
              return document;
            })
        }
      }
    },
  };

  return Schema;
};