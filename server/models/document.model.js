'use strict';

const _ = require('lodash');
const Config = require('../../config');

const USER_ROLES = Config.get('/constants/USER_ROLES');

module.exports = function (mongoose) {
  var modelName = "document";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    title: {
      type: Types.String,
      required: true
    },
    body: {
      type: Types.String
    },
    owner: {
      type: Types.ObjectId,
      ref: "user",
      allowOnUpdate: false,
      allowOnCreate: false,
    },
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      authorizeDocumentCreator: true,
      associations: {
        owner: {
          type: "MANY_ONE",
          model: "user",
        },
        users: {
          type: "MANY_MANY",
          alias: "user",
          model: "user",
          linkingModel: "user_document"
        },
      }
    }
  };

  return Schema;
};