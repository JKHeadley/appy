'use strict'

const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const Chalk = require('chalk')
const errorHelper = require('../utilities/error-helper')

const Config = require('../../config')
const auditLog = require('../policies/audit-log.policy')

const authStrategy = Config.get('/restHapiConfig/authStrategy')

module.exports = function(server, mongoose, logger) {
  // Logout Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Logout'))
    const Session = mongoose.model('session')

    const headersValidation = Joi.object({
      authorization: Joi.string().required()
    }).options({ allowUnknown: true })

    Log.note('Generating Logout endpoint')

    const logoutHandler = async function(request, h) {
      try {
        const credentials = request.auth.credentials || { session: null }
        const session = credentials.session

        if (session) {
          let sessionDoc = await Session.findByIdAndRemove(session._id)
          if (!sessionDoc) {
            throw Boom.notFound('Session not found')
          }

          return { message: 'Success' }
        } else {
          throw Boom.badRequest(
            'Refresh token required in auth header to log out'
          )
        }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'DELETE',
      path: '/logout',
      config: {
        handler: logoutHandler,
        auth: authStrategy,
        description: 'User logout.',
        tags: ['api', 'Logout'],
        validate: {
          headers: headersValidation
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [auditLog(mongoose, {}, Log)]
        }
      }
    })
  })()
}
