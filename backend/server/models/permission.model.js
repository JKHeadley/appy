'use strict'

const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/error-helper')
const Config = require('../../config')

const permissionAuth = require('../policies/permission-auth.policy')
const rankAuth = require('../policies/role-auth.policy').rankAuth

const enableDemoAuth = Config.get('/enableDemoAuth')
const demoAuth = enableDemoAuth ? 'demoAuth' : null
const PERMISSION_STATES = Config.get('/constants/PERMISSION_STATES')
const USER_ROLES = Config.get('/constants/USER_ROLES')

module.exports = function(mongoose) {
  var modelName = 'permission'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
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
        description:
          'Specifies the scope required to be able to assign this permission to users.'
      }
    },
    { collection: modelName }
  )
  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      policies: {
        associatePolicies: [
          rankAuth(mongoose, 'child'),
          permissionAuth(mongoose, true),
          demoAuth
        ],
        updatePolicies: [demoAuth],
        deletePolicies: [demoAuth]
      },
      associations: {
        users: {
          type: 'MANY_MANY',
          alias: 'user',
          model: 'user',
          linkingModel: 'user_permission'
        },
        roles: {
          type: 'MANY_MANY',
          alias: 'role',
          model: 'role',
          linkingModel: 'role_permission'
        },
        groups: {
          type: 'MANY_MANY',
          alias: 'group',
          model: 'group',
          linkingModel: 'group_permission'
        }
      }
    },

    /**
     * Gets the effective permissions for a user which are determined by the permissions hierarchy.
     * @param user
     * @param logger
     * @returns {*|Promise|Promise.<TResult>}
     */
    getEffectivePermissions: async function(user, logger) {
      const Log = logger.bind('getEffectivePermissions')
      try {
        const User = mongoose.model('user')

        user = await RestHapi.find(
          User,
          user._id,
          { $embed: ['permissions', 'role.permissions', 'groups.permissions'] },
          Log
        )

        // base permissions are set by the user's role
        const permissions = user.role.permissions

        // group permissions override role permissions
        user.groups.forEach(function(group) {
          group.group.permissions.forEach(function(groupPermission) {
            let matchIndex = -1
            permissions.find(function(permission, index) {
              if (
                permission.permission._id.toString() ===
                groupPermission.permission._id.toString()
              ) {
                matchIndex = index
                return true
              }
            })

            if (matchIndex > -1) {
              permissions[matchIndex] = groupPermission
            } else {
              permissions.push(groupPermission)
            }
          })
        })

        // user permissions override group permissions
        user.permissions.forEach(function(userPermission) {
          let matchIndex = -1
          permissions.find(function(permission, index) {
            if (
              permission.permission._id.toString() ===
              userPermission.permission._id.toString()
            ) {
              matchIndex = index
              return true
            }
          })

          if (matchIndex > -1) {
            permissions[matchIndex] = userPermission
          } else {
            permissions.push(userPermission)
          }
        })

        return permissions
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    },

    /**
     * Gets scope specific to the user. By default this is just 'user-{userId}'.
     * @param user
     * @param logger
     * @returns {*|Promise|Promise.<TResult>}
     */
    getSpecificScope: async function(user, logger) {
      const Log = logger.bind('getSpecificScope')
      try {
        const User = mongoose.model('user')

        user = await RestHapi.find(User, user._id, {}, Log)

        const scope = []

        scope.push('user-' + user._id)

        return scope
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    },

    /**
     * Gets the scope for a user, which consists of their role name, group names, effective permissions, and
     * any permissions specific to the user.
     * @param user
     * @param logger
     * @returns {*|Promise|Promise.<TResult>}
     */
    getScope: async function(user, logger) {
      const Log = logger.bind('getScope')
      try {
        const User = mongoose.model('user')
        const promises = []

        promises.push(this.getEffectivePermissions(user, Log))
        promises.push(
          RestHapi.find(User, user._id, { $embed: ['role', 'groups'] }, Log)
        )
        promises.push(this.getSpecificScope(user, Log))
        let result = await Promise.all(promises)
        const permissions = result[0]
        const role = result[1].role.name
        const groups = []
        result[1].groups.forEach(function(group) {
          groups.push(group.group.name)
        })

        let scope = []
        scope.push(role)
        scope = scope.concat(groups)

        /**
         * The scope additions from permissions depends on the permission state as follows:
         * Included: the permission is included in the scope
         * Excluded: the permission is excluded from the scope
         * Forbidden: the permission is included with a '-' prefix
         */
        scope = scope.concat(
          permissions
            .map(function(permission) {
              switch (permission.state) {
                case PERMISSION_STATES.INCLUDED:
                  return permission.permission.name
                case PERMISSION_STATES.EXCLUDED:
                  return
                case PERMISSION_STATES.FORBIDDEN:
                  return '-' + permission.permission.name
              }
            })
            .filter(Boolean)
        )

        const specificPermissions = result[2]

        scope = scope.concat(specificPermissions)

        return scope
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }
  }

  return Schema
}
