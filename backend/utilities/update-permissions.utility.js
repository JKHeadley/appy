'use strict'

process.env.NODE_ENV = 'local'

const path = require('path')
const Mongoose = require('mongoose')
const RestHapi = require('rest-hapi')

const Config = require('../config')

const restHapiConfig = Config.get('/restHapiConfig')
const USER_ROLES = Config.get('/constants/USER_ROLES')

const superAdminAssignScope = require('../config/super-admin-assign-scope.conf')

/**
 * A function that generates permissions relevant to each model.
 * NOTE: If some permissions already exist, you might receive a "duplicate key" error, however all generated
 * permissions that don't already exist should still be successfully added.
 * @param models
 * @returns {Promise<*>}
 */
async function updatePermissions(models) {
  RestHapi.config.loglevel = 'DEBUG'
  const Log = RestHapi.getLogger('update-permissions')

  try {
    if (!models) {
      Mongoose.Promise = Promise

      RestHapi.config = restHapiConfig
      RestHapi.config.absoluteModelPath = true
      RestHapi.config.modelPath = path.join(__dirname, '/../server/models')

      Mongoose.connect(restHapiConfig.mongo.URI)

      models = await RestHapi.generateModels(Mongoose)
    }

    let promises = []

    for (const modelKey in models) {
      const model = models[modelKey]
      const modelName =
        model.collectionName[0].toUpperCase() + model.collectionName.slice(1)
      const permissions = []
      let name = ''
      let assignScope

      permissions.push({
        name: model.collectionName,
        description: 'Full access to ' + model.collectionName + ' endpoints',
        assignScope: [USER_ROLES.SUPER_ADMIN]
      })
      permissions.push({
        name: 'associate' + modelName,
        description:
          'Can access all association endpoints for a ' + model.collectionName,
        assignScope: [USER_ROLES.SUPER_ADMIN]
      })
      permissions.push({
        name: 'add' + modelName + 'Associations',
        description: 'Can add all associations for a ' + model.collectionName,
        assignScope: [USER_ROLES.SUPER_ADMIN]
      })
      permissions.push({
        name: 'remove' + modelName + 'Associations',
        description:
          'Can remove all associations for a ' + model.collectionName,
        assignScope: [USER_ROLES.SUPER_ADMIN]
      })
      permissions.push({
        name: 'get' + modelName + 'Associations',
        description: 'Can get all associations for a ' + model.collectionName,
        assignScope: [USER_ROLES.SUPER_ADMIN]
      })

      name = 'create' + modelName
      assignScope =
        superAdminAssignScope.indexOf(name) > -1
          ? [USER_ROLES.SUPER_ADMIN]
          : undefined
      permissions.push({
        name: name,
        description: 'Can create a ' + model.collectionName,
        assignScope
      })

      name = 'read' + modelName
      assignScope =
        superAdminAssignScope.indexOf(name) > -1
          ? [USER_ROLES.SUPER_ADMIN]
          : undefined
      permissions.push({
        name: 'read' + modelName,
        description: 'Can read a ' + model.collectionName,
        assignScope
      })

      name = 'update' + modelName
      assignScope =
        superAdminAssignScope.indexOf(name) > -1
          ? [USER_ROLES.SUPER_ADMIN]
          : undefined
      permissions.push({
        name: 'update' + modelName,
        description: 'Can update a ' + model.collectionName,
        assignScope
      })

      name = 'delete' + modelName
      assignScope =
        superAdminAssignScope.indexOf(name) > -1
          ? [USER_ROLES.SUPER_ADMIN]
          : undefined
      permissions.push({
        name: 'delete' + modelName,
        description: 'Can delete a ' + model.collectionName,
        assignScope
      })

      const associations = model.routeOptions.associations

      for (const key in associations) {
        if (
          associations[key].type === 'MANY_MANY' ||
          associations[key].type === 'ONE_MANY'
        ) {
          const associationName = key[0].toUpperCase() + key.slice(1)

          name = 'add' + modelName + associationName
          assignScope =
            superAdminAssignScope.indexOf(name) > -1
              ? [USER_ROLES.SUPER_ADMIN]
              : undefined
          permissions.push({
            name: 'add' + modelName + associationName,
            description: 'Can add ' + key + ' to a ' + model.collectionName,
            assignScope
          })

          name = 'remove' + modelName + associationName
          assignScope =
            superAdminAssignScope.indexOf(name) > -1
              ? [USER_ROLES.SUPER_ADMIN]
              : undefined
          permissions.push({
            name: 'remove' + modelName + associationName,
            description:
              'Can remove ' + key + ' from a ' + model.collectionName,
            assignScope
          })

          name = 'get' + modelName + associationName
          assignScope =
            superAdminAssignScope.indexOf(name) > -1
              ? [USER_ROLES.SUPER_ADMIN]
              : undefined
          permissions.push({
            name: 'get' + modelName + associationName,
            description: 'Can get a ' + model.collectionName + "'s " + key,
            assignScope
          })
        }
      }

      let promise = RestHapi.create(models.permission, permissions, Log).catch(
        err => {
          // Ignore all duplicate errors
          if (err.message !== 'There was a duplicate key error.') {
            throw err
          }
        }
      )

      promises.push(promise)
    }

    await Promise.all(promises)

    Log.log('Permissions Updated')

    return models
  } catch (err) {
    Log.error(err)
    throw err
  }
}

module.exports = updatePermissions
