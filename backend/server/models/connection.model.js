'use strict'

const RestHapi = require('rest-hapi')

const connectionUpdateAuth = require('../policies/connectionAuth')

module.exports = function(mongoose) {
  var modelName = 'connection'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
      primaryUser: {
        type: Types.ObjectId,
        ref: 'user',
        allowOnUpdate: false,
        required: true
      },
      connectedUser: {
        type: Types.ObjectId,
        ref: 'user',
        allowOnUpdate: false,
        required: true
      },
      isFollowing: {
        type: Types.Boolean,
        default: false
      },
      isFollowed: {
        type: Types.Boolean,
        default: false
      },
      isContact: {
        type: Types.Boolean,
        default: false
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      policies: {
        // only the primaryUser can update a connection
        updatePolicies: [connectionUpdateAuth(mongoose)]
      },
      associations: {
        primaryUser: {
          type: 'MANY_ONE',
          model: 'user'
        },
        connectedUser: {
          type: 'ONE_ONE',
          model: 'user'
        }
      },
      create: {
        pre: function(payload, request, Log) {
          const Connection = mongoose.model('connection')
          const Notification = mongoose.model('notification')
          // Connections must be made both ways
          if (!payload.isSecondary) {
            const secondaryPayload = {
              isSecondary: true
            }
            if (payload.connectedUser) {
              secondaryPayload.primaryUser = payload.connectedUser
            }
            if (payload.primaryUser) {
              secondaryPayload.connectedUser = payload.primaryUser
            }
            if (payload.isContact) {
              secondaryPayload.isContact = payload.isContact
            }
            if (payload.isFollowed) {
              secondaryPayload.isFollowing = payload.isFollowed
            }
            if (payload.isFollowing) {
              secondaryPayload.isFollowed = payload.isFollowing
            }

            return RestHapi.create(Connection, secondaryPayload, Log).then(
              function(result) {
                Notification.createConnectionNotification(
                  payload,
                  payload,
                  request.server,
                  Log
                )
                return payload
              }
            )
          } else {
            delete payload.isSecondary
            return payload
          }
        }
      },
      update: {
        pre: function(_id, payload, request, Log) {
          const Connection = mongoose.model('connection')
          const Notification = mongoose.model('notification')
          let primaryConnection = {}
          // Connections must be updated both ways
          if (!payload.isSecondary) {
            const secondaryPayload = {
              isSecondary: true
            }
            if (payload.connectedUser) {
              secondaryPayload.primaryUser = payload.connectedUser
            }
            if (payload.primaryUser) {
              secondaryPayload.connectedUser = payload.primaryUser
            }
            if (payload.isContact) {
              secondaryPayload.isContact = payload.isContact
            }
            if (payload.isFollowed) {
              secondaryPayload.isFollowing = payload.isFollowed
            }
            if (payload.isFollowing) {
              secondaryPayload.isFollowed = payload.isFollowing
            }

            return RestHapi.find(Connection, _id, {}, Log)
              .then(function(result) {
                if (!result) {
                  // TODO: Use actual error once rest-hapi supports it.
                  throw 'Connection not found.' // eslint-disable-line no-throw-literal
                }
                primaryConnection = result
                return RestHapi.list(
                  Connection,
                  {
                    primaryUser: primaryConnection.connectedUser,
                    connectedUser: primaryConnection.primaryUser
                  },
                  Log
                )
              })
              .then(function(result) {
                if (!result.docs[0]) {
                  // TODO: Use actual error once rest-hapi supports it.
                  throw 'Secondary connection not found.' // eslint-disable-line no-throw-literal
                }
                return RestHapi.update(
                  Connection,
                  result.docs[0]._id,
                  secondaryPayload,
                  Log
                ).then(function(result) {
                  Notification.createConnectionNotification(
                    primaryConnection,
                    payload,
                    request.server,
                    Log
                  )
                  return payload
                })
              })
          } else {
            delete payload.isSecondary
            return payload
          }
        }
      }
    }
  }

  // This model acts as a one-way association between two users
  Schema.index({ primaryUser: 1, connectedUser: 1 }, { unique: true })

  return Schema
}
