'use strict';

const RestHapi = require('rest-hapi');
const _ = require('lodash');
const Config = require('../config/config');

const USER_ROLES = Config.get('/constants/USER_ROLES');
const CHAT_TYPES = Config.get('/constants/CHAT_TYPES');

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
    chatType: {
      type: Types.String,
      required: true,
      enum: _.values(CHAT_TYPES)
    },
  }, { collection: modelName });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      routeScope: {
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
