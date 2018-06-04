'use strict'

const Joi = require('joi')
const Chalk = require('chalk')
const errorHelper = require('../utilities/error-helper')

const Config = require('../../config')

module.exports = function(server, mongoose, logger) {
  // Contact Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Contact'))

    Log.note('Generating Contact endpoint')

    const contactHandler = async function(request, h) {
      try {
        const mailer = request.server.plugins.mailer
        const emailOptions = {
          subject: Config.get('/projectName') + ' contact form',
          to: Config.get('/system/toAddress'),
          replyTo: {
            name: request.payload.name,
            address: request.payload.email
          }
        }
        const template = 'contact'

        await mailer.sendEmail(emailOptions, template, request.payload, Log)

        return { message: 'Success' }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'POST',
      path: '/contact',
      config: {
        handler: contactHandler,
        description: 'Send Contact Email.',
        tags: ['api', 'Contact'],
        validate: {
          payload: {
            name: Joi.string().required(),
            email: Joi.string()
              .email()
              .required(),
            message: Joi.string().required()
          }
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
        }
      }
    })
  })()
}
