'use strict'

const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/errorHelper')

const Config = require('../../config/config')

const NOTIFICATION_TYPES = Config.get('/constants/NOTIFICATION_TYPES')

module.exports = function(mongoose) {
  var modelName = 'document'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
      title: {
        type: Types.String,
        required: true
      },
      body: {
        type: Types.String
      },
      owner: {
        type: Types.ObjectId,
        ref: 'user',
        allowOnUpdate: false,
        allowOnCreate: false
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      documentScope: {
        rootScope: ['root']
      },
      authorizeDocumentCreator: true,
      associations: {
        owner: {
          type: 'MANY_ONE',
          model: 'user'
        },
        users: {
          type: 'MANY_MANY',
          alias: 'user',
          model: 'user',
          linkingModel: 'user_document'
        }
      },
      create: {
        pre: async function(payload, request, logger) {
          const Log = logger.bind()
          try {
            payload.owner = request.auth.credentials.user._id
            return payload
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      add: {
        users: {
          pre: async function(payload, request, Log) {
            try {
              const Document = mongoose.model('document')
              const Notification = mongoose.model('notification')
              let document = await RestHapi.find(Document, request.params.ownerId, {}, Log)
              const scope = document.scope
              // Add permissions for shared users to either edit or view the document
              payload.forEach(function(userDocument) {
                // Remove any previous permissions before adding new ones
                Document.removeDocumentPermissions(
                  scope,
                  userDocument.childId
                )
                if (userDocument.canEdit) {
                  scope.updateScope = scope.updateScope || []
                  scope.updateScope.push('user-' + userDocument.childId)
                }
                scope.readScope = scope.readScope || []
                scope.readScope.push('user-' + userDocument.childId)

                // Create a notification for the user that is gaining access
                let notification = {
                  primaryUser: userDocument.childId,
                  actingUser: document.owner,
                  type: NOTIFICATION_TYPES.SHARED_DOCUMENT
                }
                Notification.createDocumentNotification(
                  notification,
                  request.server,
                  Log
                )
              })
              await RestHapi.update(Document, document._id, { scope }, Log)

              return payload
            } catch (err) {
              errorHelper.handleError(err, Log)
            }
          }
        }
      },
      remove: {
        users: {
          pre: async function(payload, request, Log) {
            try {
              const Document = mongoose.model('document')
              let document = await RestHapi.find(Document, request.params.ownerId, {}, Log)
              const scope = document.scope
              const userId = request.params.childId
              Document.removeDocumentPermissions(scope, userId)
              await RestHapi.update(Document, document._id, { scope }, Log)
              return payload
            } catch (err) {
              errorHelper.handleError(err, Log)
            }
          }
        }
      }
    },
    removeDocumentPermissions: function(scope, userId) {
      // Remove document permissions for user
      scope.updateScope = scope.updateScope || []
      scope.updateScope = scope.updateScope.filter(function(value) {
        return value !== 'user-' + userId
      })
      scope.readScope = scope.readScope || []
      scope.readScope = scope.readScope.filter(function(value) {
        return value !== 'user-' + userId
      })
    }
  }

  return Schema
}
