'use strict';

const RestHapi = require('rest-hapi');
const _ = require('lodash');
const Config = require('../../config');

const USER_ROLES = Config.get('/constants/USER_ROLES');

module.exports = function (mongoose) {
  var modelName = "conversation";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      description: 'The name of the chat.'
    },
    lastMessage: {
      type: Types.ObjectId,
      ref: "message"
    },
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      routeScope: {
        createScope: _.values(USER_ROLES)
      },
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
        userData: {
          type: "MANY_MANY",
          alias: "user-data",
          model: "user",
          linkingModel: "user_conversation"
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