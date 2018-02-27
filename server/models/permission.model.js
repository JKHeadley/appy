'use strict';

const RestHapi = require('rest-hapi');
const Q = require('q');
const _ = require('lodash');
const Config = require('../../config');

const permissionAuth = require('../policies/permissionAuth');
const rankAuth = require('../policies/roleAuth').rankAuth;

const PERMISSION_STATES = Config.get('/constants/PERMISSION_STATES');
const USER_ROLES = Config.get('/constants/USER_ROLES')

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
    },
    assignScope: {
      type: [Types.String],
      default: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      description: "Specifies the scope required to be able to assign this permission to users."
    }
  }, { collection: modelName });
  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      policies: {
        associatePolicies: [rankAuth(mongoose, "child"), permissionAuth(mongoose, true)]
      },
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

      return RestHapi.find(User, user._id, { $embed: ['permissions', 'role.permissions', 'groups.permissions'] }, Log)
        .then(function (result) {
          let user = result;

          //EXPL: base permissions are set by the user's role
          const permissions = user.role.permissions;

          //EXPL: group permissions override role permissions
          user.groups.forEach(function (group) {
            group.group.permissions.forEach(function (group_permission) {
              let matchIndex = -1;
              permissions.find(function (permission, index) {
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
            });
          });

          //EXPL: user permissions override group permissions
          user.permissions.forEach(function (user_permission) {
            let matchIndex = -1;
            permissions.find(function (permission, index) {
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
     * Gets scope specific to the user. By default this is just 'user-{userId}'.
     * @param user
     * @param Log
     * @returns {*|Promise|Promise.<TResult>}
     */
    getSpecificScope: function (user, Log) {
        const User = mongoose.model('user');

        return RestHapi.find(User, user._id, {}, Log)
            .then(function (result) {
                let user = result;

                const scope = [];

                scope.push('user-' + user._id);

                return scope;
            });
    },

    /**
     * Gets the scope for a user, which consists of their role name, group names, effective permissions, and
     * any permissions specific to the user.
     * @param user
     * @param Log
     * @returns {*|Promise|Promise.<TResult>}
     */
    getScope: function (user, Log) {
      const User = mongoose.model('user');
      const promises = [];

      promises.push(this.getEffectivePermissions(user, Log));
      promises.push(RestHapi.find(User, user._id, { $embed: ['role', 'groups'] }, Log));
      promises.push(this.getSpecificScope(user, Log));
      return Q.all(promises)
        .then(function (result) {
          const permissions = result[0];
          const role = result[1].role.name;
          const groups = [];
          result[1].groups.forEach(function (group) {
            groups.push(group.group.name);
          });

          let scope = [];
          scope.push(role);
          scope = scope.concat(groups);

          /**
           * The scope additions from permissions depends on the permission state as follows:
           * Included: the permission is included in the scope
           * Excluded: the permission is excluded from the scope
           * Forbidden: the permission is included with a '-' prefix
           */
          scope = scope.concat(permissions.map(function (permission) {
            switch(permission.state) {
              case PERMISSION_STATES.INCLUDED:
                return permission.permission.name;
              case PERMISSION_STATES.EXCLUDED:
                return;
              case PERMISSION_STATES.FORBIDDEN:
                return '-' + permission.permission.name;
            }
          }).filter(Boolean));

          const specificPermissions = result[2];

          scope = scope.concat(specificPermissions);

          return scope;
        });
    }
  };

  return Schema;
};
