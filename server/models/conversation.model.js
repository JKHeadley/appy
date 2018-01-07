'use strict';

const RestHapi = require('rest-hapi');

module.exports = function (mongoose) {
  var modelName = "conversation";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      policies: {
      },
      associations: {
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