'use strict'

const Joi = require('joi')
const Chalk = require('chalk')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/errorHelper')

const Config = require('../../config/config')

const authStrategy = Config.get('/restHapiConfig/authStrategy')

const headersValidation = Joi.object({
  authorization: Joi.string().required()
}).options({ allowUnknown: true })

module.exports = function(server, mongoose, logger) {
  // Get Available Permissions Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Get Available Permissions'))
    const Permission = mongoose.model('permission')

    Log.note('Get Available Permissions endpoint')

    const getAvailablePermissionsHandler = async function(request, h) {
      try {
        Log.log('query(%s)', JSON.stringify(request.query))

        const roleName = request.auth.credentials.user.roleName

        const where = {
          assignScope: { $elemMatch: { $eq: roleName } }
        }

        request.query.$where = Object.assign(where, request.query.$where)

        return await RestHapi.list(Permission, request.query, Log)
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    const queryModel = RestHapi.joiHelper.generateJoiListQueryModel(
      Permission,
      Log
    )

    server.route({
      method: 'GET',
      path: '/permission/available',
      config: {
        handler: getAvailablePermissionsHandler,
        auth: {
          strategy: authStrategy,
          scope: [
            'root',
            'readAvailableNotifications',
            '!-readAvailableNotifications'
          ]
        },
        description:
          'Get the permissions available for the current user to assign.',
        tags: ['api', 'Available Permissions'],
        validate: {
          headers: headersValidation,
          query: queryModel
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          }
        },
        response: {
          schema: Joi.object({
            docs: Joi.array().items(
              RestHapi.joiHelper.generateJoiReadModel(Permission)
            ),
            pages: Joi.any(),
            items: Joi.any()
          })
        }
      }
    })
  })()
}
