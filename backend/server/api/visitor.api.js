'use strict'

const Chalk = require('chalk')
const RestHapi = require('rest-hapi')

const iplocation = require('iplocation')
const useragent = require('useragent')
const errorHelper = require('../utilities/error-helper')

const Config = require('../../config')

module.exports = function(server, mongoose, logger) {
  // Record Visitor Endpoint
  ;(function() {
    const Visitor = mongoose.model('visitor')
    const Log = logger.bind(Chalk.magenta('Visitor'))

    Log.note('Generating Record Visitor endpoint')

    const recordVisitorHandler = async function(request, h) {
      try {
        // Specify the iplocation hosts to prevent issues (Ex: docker cant ping "https://ipaip.co/" by default)
        // let hosts = ['freegeoip.net', 'ipapi.co']
        // NOTE: Sign up for free access key at https://ipstack.com/
        let host =
          'http://api.ipstack.com/*?access_key=' +
          Config.get('/ipstackAccessKey') +
          '&format=1'

        let result = await iplocation(server.methods.getIP(request), [host])
        const agent = useragent.parse(request.headers['user-agent'])

        const visitor = Object.assign(result, { browser: agent.family })

        return RestHapi.create(Visitor, visitor, Log)
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'POST',
      path: '/visitor',
      config: {
        handler: recordVisitorHandler,
        auth: null,
        description: 'Create a new visitor record.',
        tags: ['api', 'Visitor'],
        validate: {},
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
