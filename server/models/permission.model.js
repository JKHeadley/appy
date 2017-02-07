'use strict';

const RestHapi = require('rest-hapi');

module.exports = function (mongoose) {
  var modelName = "permission";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    }
  });
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        users: {
          type: "MANY_MANY",
          alias: "user",
          model: "user",
          linkingModel: "user_permission"
        },
        roles: {
          type: "MANY_MANY",
          alias: "role",
          model: "role",
          linkingModel: "role_permission"
        },
        groups: {
          type: "MANY_MANY",
          alias: "group",
          model: "group",
          linkingModel: "group_permission"
        }
      }
    },

    getEffectivePermissions: function (user, Log) {

      const User = mongoose.model('user');

      return RestHapi.find(User, user._id, { $embed: ['permissions','role.permissions','groups.permissions'] }, Log)
        .then(function(result) {
          let user = result;
          Log.debug("USER:", user);
          Log.debug("user permissions:", user.permissions);
          if (user.groups[0]) {
            Log.debug("group permissions:", user.groups[0].group.permissions);
          }
          Log.debug("role permissions:", user.role.permissions);
        })
    }
  };

  return Schema;
};