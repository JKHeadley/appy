'use strict'

const Chalk = require('chalk')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/error-helper')

module.exports = function(server, mongoose, logger) {
  // Dashboard Stats Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Dashboard Stats'))
    const User = mongoose.model('user')
    const Document = mongoose.model('document')
    const Image = mongoose.model('image')
    const Message = mongoose.model('message')
    const Visitor = mongoose.model('visitor')

    Log.note('Generating Dashboard Stats endpoint')

    const dashboardStatsHandler = async function(request, h) {
      try {
        let promises = []
        let stats = {}
        promises.push(
          RestHapi.list(User, { isDeleted: false, $count: true }, Log)
        )
        promises.push(
          RestHapi.list(Document, { isDeleted: false, $count: true }, Log)
        )
        promises.push(
          RestHapi.list(Image, { isDeleted: false, $count: true }, Log)
        )
        promises.push(
          RestHapi.list(Message, { isDeleted: false, $count: true }, Log)
        )
        promises.push(
          RestHapi.list(
            User,
            {
              isDeleted: false,
              $where: { facebookId: { $exists: true } },
              $count: true
            },
            Log
          )
        )
        promises.push(
          RestHapi.list(
            User,
            {
              isDeleted: false,
              $where: { googleId: { $exists: true } },
              $count: true
            },
            Log
          )
        )
        promises.push(
          RestHapi.list(
            User,
            {
              isDeleted: false,
              $where: { githubId: { $exists: true } },
              $count: true
            },
            Log
          )
        )
        promises.push(
          RestHapi.list(Visitor, { isDeleted: false, $count: true }, Log)
        )

        let result = await Promise.all(promises)

        stats = {
          userCount: result[0],
          documentCount: result[1],
          imageCount: result[2],
          messageCount: result[3],
          facebookUserCount: result[4],
          googleUserCount: result[5],
          githubUserCount: result[6],
          visitorCount: result[7]
        }

        promises = []
        let step = {}

        // MONGO AGGREGATION PIPELINE EXAMPLE

        // region BUILD TOTAL VISITORS PER COUNTRY QUERY

        const visitorsPerCountryQuery = []

        // Group and count visitors from each country
        step = {}

        step.$group = {
          _id: '$country_code',
          visitorCount: { $sum: 1 }
        }

        visitorsPerCountryQuery.push(step)

        // Format the data for the next step
        step = {}

        step.$group = {
          _id: null,
          totalVisitorsPerCountry: {
            $push: { k: '$_id', v: '$visitorCount' }
          }
        }

        visitorsPerCountryQuery.push(step)

        // Remove null values since they cause errors in the next step
        step = {}

        step.$project = {
          totalVisitorsPerCountry: {
            $filter: {
              input: '$totalVisitorsPerCountry',
              as: 'data',
              cond: { $ne: ['$$data.k', null] }
            }
          }
        }

        visitorsPerCountryQuery.push(step)

        // Transform data from array to object
        step = {}

        step.$project = {
          _id: 0,
          totalVisitorsPerCountry: {
            $arrayToObject: '$totalVisitorsPerCountry'
          }
        }

        visitorsPerCountryQuery.push(step)

        promises.push(Visitor.aggregate(visitorsPerCountryQuery))

        // endregion

        // region BUILD TOTAL VISITORS PER BROWSER QUERY

        const visitorsPerBrowserQuery = []

        // Group and count each browser
        step = {}

        step.$group = {
          _id: '$browser',
          visitorCount: { $sum: 1 }
        }

        visitorsPerBrowserQuery.push(step)

        // Format the data for the next step
        step = {}

        step.$group = {
          _id: null,
          totalVisitorsPerBrowser: {
            $push: { k: '$_id', v: '$visitorCount' }
          }
        }

        visitorsPerBrowserQuery.push(step)

        // Remove null values since they cause errors in the next step
        step = {}

        step.$project = {
          totalVisitorsPerCountry: {
            $filter: {
              input: '$totalVisitorsPerCountry',
              as: 'data',
              cond: { $ne: ['$$data.k', null] }
            }
          }
        }

        visitorsPerCountryQuery.push(step)

        // Transform data from array to object
        step = {}

        step.$project = {
          _id: 0,
          totalVisitorsPerBrowser: {
            $arrayToObject: '$totalVisitorsPerBrowser'
          }
        }

        visitorsPerBrowserQuery.push(step)

        promises.push(Visitor.aggregate(visitorsPerBrowserQuery))

        // endregion

        result = await Promise.all(promises)

        stats.totalVisitorsPerCountry = result[0][0] ? result[0][0].totalVisitorsPerCountry : 0
        stats.totalVisitorsPerBrowser = result[1][0] ? result[1][0].totalVisitorsPerBrowser : 0

        return { stats }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'GET',
      path: '/stats/dashboard',
      config: {
        handler: dashboardStatsHandler,
        auth: null,
        description: 'Get stats for the dashboard.',
        tags: ['api', 'Stats', 'Dashboard'],
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
