'use strict'

const Bcrypt = require('bcryptjs')
const GeneratePassword = require('password-generator')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/errorHelper')

const permissionAuth = require('../policies/permissionAuth')
const groupAuth = require('../policies/groupAuth')
const rankAuth = require('../policies/roleAuth').rankAuth
const promoteAuth = require('../policies/roleAuth').promoteAuth

const Config = require('../../config/config')

const enableDemoAuth = Config.get('/enableDemoAuth')
const demoAuth = enableDemoAuth ? 'demoAuth' : null

module.exports = function(mongoose) {
  const modelName = 'user'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
    {
      firstName: {
        type: Types.String,
        required: true
      },
      lastName: {
        type: Types.String,
        required: true
      },
      email: {
        type: Types.String,
        required: true,
        stringType: 'email'
      },
      title: {
        type: Types.String
      },
      education: {
        type: Types.String
      },
      location: {
        type: Types.String
      },
      bio: {
        type: Types.String
      },
      profileImageUrl: {
        type: Types.String,
        stringType: 'uri'
      },
      role: {
        type: Types.ObjectId,
        ref: 'role'
      },
      isActive: {
        type: Types.Boolean,
        allowOnUpdate: false,
        default: false
      },
      isEnabled: {
        type: Types.Boolean,
        allowOnUpdate: false,
        default: true
      },
      password: {
        type: Types.String,
        exclude: true,
        allowOnUpdate: false
      },
      pin: {
        type: Types.String,
        exclude: true,
        allowOnUpdate: false
      },
      facebookId: {
        type: Types.String,
        allowOnUpdate: false
      },
      googleId: {
        type: Types.String,
        allowOnUpdate: false
      },
      githubId: {
        type: Types.String,
        allowOnUpdate: false
      },
      resetPassword: {
        hash: {
          type: Types.String
        },
        pinRequired: {
          type: Types.Boolean
        },
        allowOnCreate: false,
        allowOnUpdate: false,
        exclude: true,
        type: Types.Object
      },
      activateAccountHash: {
        allowOnCreate: false,
        allowOnUpdate: false,
        exclude: true,
        type: Types.String
      },
      passwordUpdateRequired: {
        type: Types.Boolean,
        allowOnCreate: false,
        allowOnUpdate: false,
        default: false
      },
      pinUpdateRequired: {
        type: Types.Boolean,
        allowOnCreate: false,
        allowOnUpdate: false,
        default: false
      },
      socialLoginHash: {
        allowOnCreate: false,
        allowOnUpdate: false,
        exclude: true,
        type: Types.String
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      authorizeDocumentCreator: false,
      policies: {
        associatePolicies: [
          rankAuth(mongoose, 'ownerId'),
          permissionAuth(mongoose, false),
          groupAuth(mongoose, false),
          demoAuth
        ],
        updatePolicies: [
          rankAuth(mongoose, '_id'),
          promoteAuth(mongoose),
          demoAuth
        ],
        deletePolicies: [rankAuth(mongoose, '_id'), demoAuth]
      },
      routeScope: {
        // Users can access their own Notifications
        getUserNotificationsScope: 'user-{params.ownerId}',
        // Users can access their own Connections
        getUserConnectionsScope: 'user-{params.ownerId}',
        // Users can access their own Documents
        getUserDocumentsScope: 'user-{params.ownerId}',
        // Users can access their own Shared Documents
        getUserSharedDocumentsScope: 'user-{params.ownerId}',
        // Users can access their own Images
        getUserImagesScope: 'user-{params.ownerId}'
      },
      associations: {
        role: {
          type: 'MANY_ONE',
          model: 'role',
          duplicate: [
            {
              field: 'name'
            },
            {
              field: 'rank'
            }
          ]
        },
        groups: {
          type: 'MANY_MANY',
          alias: 'group',
          model: 'group'
        },
        permissions: {
          type: 'MANY_MANY',
          alias: 'permission',
          model: 'permission',
          linkingModel: 'user_permission'
        },
        connections: {
          type: 'ONE_MANY',
          alias: 'connection',
          foreignField: 'primaryUser',
          model: 'connection'
        },
        conversations: {
          type: 'MANY_MANY',
          alias: 'conversation',
          model: 'conversation',
          linkingModel: 'user_conversation'
        },
        documents: {
          type: 'ONE_MANY',
          alias: 'document',
          foreignField: 'owner',
          model: 'document'
        },
        sharedDocuments: {
          type: 'MANY_MANY',
          alias: 'shared-document',
          model: 'document',
          linkingModel: 'user_document'
        },
        images: {
          type: 'ONE_MANY',
          alias: 'image',
          foreignField: 'owner',
          model: 'image'
        },
        notifications: {
          type: 'ONE_MANY',
          alias: 'notification',
          foreignField: 'primaryUser',
          model: 'notification'
        }
      },
      create: {
        pre: async function(payload, request, logger) {
          const Log = logger.bind()
          try {
            if (!payload.password) {
              payload.password = GeneratePassword(10, false)
            }
            if (!payload.pin) {
              payload.pin = GeneratePassword(4, false, /\d/)
            }

            const promises = []

            promises.push(
              mongoose.model('user').generateHash(payload.password, Log)
            )
            promises.push(mongoose.model('user').generateHash(payload.pin, Log))
            let result = await Promise.all(promises)
            payload.password = result[0].hash
            payload.pin = result[1].hash

            return payload
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        },
        post: async function(document, request, result, logger) {
          const Log = logger.bind()
          try {
            const User = mongoose.model('user')
            if (!document.profileImageUrl) {
              let profileImageUrl =
                'https://www.gravatar.com/avatar/' +
                document._id +
                '?r=PG&d=robohash'
              return await RestHapi.update(
                User,
                document._id,
                { profileImageUrl },
                Log
              )
            } else {
              return document
            }
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      }
    },

    generateHash: async function(key, logger) {
      const Log = logger.bind()
      try {
        let salt = await Bcrypt.genSalt(10)
        let hash = await Bcrypt.hash(key, salt)
        return { key, hash }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    },

    findByCredentials: async function(email, password, logger) {
      const Log = logger.bind()
      try {
        const self = this

        const query = {
          email: email.toLowerCase(),
          isDeleted: false
        }

        let mongooseQuery = self.findOne(query)

        let user = await mongooseQuery.lean()

        if (!user) {
          return false
        }

        const source = user.password

        let passwordMatch = await Bcrypt.compare(password, source)
        if (passwordMatch) {
          return user
        }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }
  }

  return Schema
}
