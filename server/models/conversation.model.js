'use strict';

const RestHapi = require('rest-hapi');

module.exports = function (mongoose) {
  var modelName = "conversation";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    lastMessage: {
      type: Types.ObjectId,
      ref: "message"
    },
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      policies: {
      },
      associations: {
        lastMessage: {
          type: "ONE_ONE",
          model: "message"
        },
        users: {
          type: "_MANY",
          model: "user",
        },
        messages: {
          type: "ONE_MANY",
          alias: "message",
          foreignField: "conversation",
          model: "message"
        },
      }
    }
  };

  return Schema;
};