'use strict'

const _ = require('lodash')
const Config = require('../config/config')

const permissionAuth = require('../policies/permissionAuth')
const rankAuth = require('../policies/roleAuth').rankAuth

const enableDemoAuth = Config.get('/enableDemoAuth')
const demoAuth = enableDemoAuth ? 'demoAuth' : null
const USER_ROLES = Config.get('/constants/USER_ROLES')

module.exports = function(mongoose) {
  var modelName = 'role'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
      name: {
        type: Types.String,
        enum: _.values(USER_ROLES),
        required: true,
        unique: true
      },
      rank: {
        type: Types.Number,
        required: true,
        unique: true,
        description:
          'Determines the role\'s position in the hierarchy, with "0" being the highest.'
      },
      description: {
        type: Types.String
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
          permissionAuth(mongoose, false),
          demoAuth
        ],
        updatePolicies: [demoAuth],
        deletePolicies: [demoAuth]
      },
      associations: {
        users: {
          type: 'ONE_MANY',
          alias: 'user',
          foreignField: 'role',
          model: 'user'
        },
        permissions: {
          type: 'MANY_MANY',
          alias: 'permission',
          model: 'permission',
          linkingModel: 'role_permission'
        }
      }
    },
    test: function() {
      console.log('TEST')
    }
  }

  return Schema
}
