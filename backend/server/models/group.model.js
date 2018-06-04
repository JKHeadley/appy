'use strict'

const permissionAuth = require('../policies/permission-auth.policy')
const groupAuth = require('../policies/group-auth.policy')
const rankAuth = require('../policies/role-auth.policy').rankAuth

const Config = require('../../config')

const enableDemoAuth = Config.get('/enableDemoAuth')
const demoAuth = enableDemoAuth ? 'demoAuth' : null

module.exports = function(mongoose) {
  var modelName = 'group'
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
          groupAuth(mongoose, true),
          demoAuth
        ],
        updatePolicies: [demoAuth],
        deletePolicies: [demoAuth]
      },
      associations: {
        users: {
          type: 'MANY_MANY',
          alias: 'user',
          model: 'user'
        },
        permissions: {
          type: 'MANY_MANY',
          alias: 'permission',
          model: 'permission',
          linkingModel: 'group_permission'
        }
      }
    }
  }

  return Schema
}
