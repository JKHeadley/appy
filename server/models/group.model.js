'use strict';

const permissionAuth = require('../policies/permissionAuth');
const rankAuth = require('../policies/roleAuth').rankAuth;

module.exports = function (mongoose) {
  var modelName = "group";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true,
      unique: true
    },
    description: {
      type: Types.String
    }
  }, { collection: modelName });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      policies: {
        associatePolicies: [rankAuth(mongoose, "child"), permissionAuth(mongoose, true)]
      },
      associations: {
        users: {
          type: "MANY_MANY",
          alias: "user",
          model: "user"
        },
        permissions: {
          type: "MANY_MANY",
          alias: "permission",
          model: "permission",
          linkingModel: "group_permission"
        }
      }
    }
  };
  
  return Schema;
};