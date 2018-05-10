'use strict'

const RestHapi = require('rest-hapi')

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
      imageScope: {
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
        pre: function(payload, request, Log) {
          const Image = mongoose.model('image')
          payload.owner = request.auth.credentials.user._id
          return RestHapi.list(
            Image,
            { owner: payload.owner, $sort: ['index'] },
            Log
          ).then(function(result) {
            if (result.docs[0]) {
              payload.index = result.docs[0].index + 1
            } else {
              payload.index = 0
            }

            return payload
          })
        }
      }
    }
  }

  return Schema
}
