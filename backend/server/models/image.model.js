'use strict'

const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/error-helper')

module.exports = function(mongoose) {
  var modelName = 'image'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
      title: {
        type: Types.String
      },
      description: {
        type: Types.String
      },
      imageUrl: {
        type: Types.String,
        stringType: 'uri',
        required: true
      },
      index: {
        type: Types.Number,
        allowOnUpdate: false,
        allowOnCreate: false
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
      authorizeImageCreator: true,
      associations: {
        owner: {
          type: 'MANY_ONE',
          model: 'user'
        }
      },
      create: {
        pre: async function(payload, request, logger) {
          const Log = logger.bind()
          try {
            const Image = mongoose.model('image')
            payload.owner = request.auth.credentials.user._id
            let result = await RestHapi.list(
              Image,
              { owner: payload.owner, $sort: ['index'] },
              Log
            )
            if (result.docs[0]) {
              payload.index = result.docs[0].index + 1
            } else {
              payload.index = 0
            }

            return payload
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      }
    }
  }

  return Schema
}
