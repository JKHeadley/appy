'use strict';

const RestHapi = require('rest-hapi');
const Q = require('q');

module.exports = function (mongoose) {
  var modelName = "permission";
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

    /**
     * Gets the effective permissions for a user which are determined by the permissions hierarchy.
     * @param user
     * @param Log
     * @returns {*|Promise|Promise.<TResult>}
     */
    getEffectivePermissions: function (user, Log) {
      const User = mongoose.model('user');

      return RestHapi.find(User, user._id, { $embed: ['permissions','role.permissions','groups.permissions'] }, Log)
        .then(function(result) {
          let user = result;

          //EXPL: base permissions are set by the user's role
          const permissions = user.role.permissions;

          //EXPL: group permissions override role permissions
          user.groups.forEach(function(group) {
            group.group.permissions.forEach(function(group_permission) {
              let matchIndex = -1;
              permissions.find(function(permission, index) {
                if (permission.permission._id.toString() === group_permission.permission._id.toString()) {
                  matchIndex = index;
                  return true;
                }
              });

              if (matchIndex > -1) {
                permissions[matchIndex] = group_permission;
              }
              else {
                permissions.push(group_permission);
              }
            })
          });

          //EXPL: user permissions override group permissions
          user.permissions.forEach(function(user_permission) {
            let matchIndex = -1;
            permissions.find(function(permission, index) {
              if (permission.permission._id.toString() === user_permission.permission._id.toString()) {
                matchIndex = index;
                return true;
              }
            });

            if (matchIndex > -1) {
              permissions[matchIndex] = user_permission;
            }
            else {
              permissions.push(user_permission);
            }
          });

          return permissions;
        });
    },

    /**
     * Gets the scope for a user, which consists of their role name, group names, and effective permissions
     * @param user
     * @param Log
     * @returns {*|Promise|Promise.<TResult>}
     */
    getScope: function(user, Log) {
      const User = mongoose.model('user');
      const promises = [];

      promises.push(this.getEffectivePermissions(user, Log));
      promises.push(RestHapi.find(User, user._id, { $embed: ['role','groups'] }, Log));
      return Q.all(promises)
        .then(function(result) {
          const permissions = result[0];
          const role = result[1].role.name;
          const groups = [];
          result[1].groups.forEach(function(group) {
            groups.push(group.group.name);
          });

          let scope = [];
          scope.push(role);
          scope = scope.concat(groups);

          //EXPL: only add permissions that are enabled to the scope
          scope = scope.concat(permissions.map(function(permission) {
            if (permission.enabled) {
              return permission.permission.name;
            }
          }).filter(Boolean));

          return scope;
        });
    }
  };

  return Schema;
};