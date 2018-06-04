'use strict'

const Bcrypt = require('bcryptjs')
const Uuid = require('node-uuid')
const errorHelper = require('../utilities/error-helper')

module.exports = function(mongoose) {
  const modelName = 'session'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
    {
      user: {
        type: Types.ObjectId,
        ref: 'user'
      },
      key: {
        type: Types.String,
        required: true
      },
      passwordHash: {
        type: Types.String,
        required: true
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    enableSoftDelete: false,
    routeOptions: {
      associations: {
        user: {
          type: 'ONE_ONE',
          model: 'user'
        }
      }
    },

    generateKeyHash: async function(logger) {
      const Log = logger.bind()
      try {
        const key = Uuid.v4()

        let salt = await Bcrypt.genSalt(10)
        let hash = Bcrypt.hash(key, salt)

        return { key, hash }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    },

    createInstance: async function(user, logger) {
      const Log = logger.bind()
      try {
        const document = {
          user: user._id,
          key: Uuid.v4(),
          passwordHash: user.password,
          createdAt: Date.now()
        }

        let newSession = await mongoose.model('session').create(document)

        const query = {
          user: user._id,
          key: { $ne: document.key }
        }

        await mongoose.model('session').findOneAndRemove(query)

        return newSession
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    },

    findByCredentials: async function(_id, key, logger) {
      const Log = logger.bind()
      try {
        let session = await mongoose.model('session').findById(_id)
        if (!session) {
          return false
        }

        return session.key === key ? session : false
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }
  }

  return Schema
}
