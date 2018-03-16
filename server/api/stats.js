'use strict';

const Chalk = require('chalk');
const Q = require('q');
const RestHapi = require('rest-hapi');

module.exports = function (server, mongoose, logger) {

  // Dashboard Stats Endpoint
  (function() {
    const Log = logger.bind(Chalk.magenta("Dashboard Stats"));
    const User = mongoose.model('user');
    const Document = mongoose.model('document');
    const Image = mongoose.model('image');
    const Message = mongoose.model('message');
    const Visitor = mongoose.model('visitor');

    Log.note("Generating Dashboard Stats endpoint");

    const dashboardStatsHandler = function (request, reply) {

      let promises = [];
      let stats = {};
      promises.push(RestHapi.list(User, { isDeleted: false, $count: true }, Log))
      promises.push(RestHapi.list(Document, { isDeleted: false, $count: true }, Log))
      promises.push(RestHapi.list(Image, { isDeleted: false, $count: true }, Log))
      promises.push(RestHapi.list(Message, { isDeleted: false, $count: true }, Log))
      promises.push(RestHapi.list(Visitor, { isDeleted: false, $count: true }, Log))

      return Q.all(promises)
        .then(function(result) {
          stats = {
            userCount: result[0],
            documentCount: result[1],
            imageCount: result[2],
            messageCount: result[3],
            visitorCount: result[4]
          }

          promises = [];
          let step = {};

          // MONGO AGGREGATION PIPELINE EXAMPLE

          // region BUILD TOTAL VISITORS PER COUNTRY QUERY

          const visitorsPerCountryQuery = [];

          // EXPL: Group and count visitors from each country
          step = {};

          step.$group = {
            _id: '$country_code',
            visitorCount: { $sum: 1 }
          };

          visitorsPerCountryQuery.push(step);

          // EXPL: Format the data for the next step
          step = {};

          step.$group = {
            _id: null,
            totalVisitorsPerCountry: { $push: { k: '$_id', v: '$visitorCount' }}
          };

          visitorsPerCountryQuery.push(step);


          // EXPL: Transform data from array to object
          step = {};

          step.$project= {
            _id: 0,
            totalVisitorsPerCountry: { $arrayToObject: "$totalVisitorsPerCountry" }
          }

          visitorsPerCountryQuery.push(step)


          promises.push(Visitor.aggregate(visitorsPerCountryQuery));

          // endregion



          // region BUILD TOTAL VISITORS PER BROWSER QUERY

          const visitorsPerBrowserQuery = [];

          // EXPL: Group and count each browser
          step = {};

          step.$group = {
            _id: '$browser',
            visitorCount: { $sum: 1 }
          };

          visitorsPerBrowserQuery.push(step);

          // EXPL: Format the data for the next step
          step = {};

          step.$group = {
            _id: null,
            totalVisitorsPerBrowser: { $push: { k: '$_id', v: '$visitorCount' }}
          };

          visitorsPerBrowserQuery.push(step);


          // EXPL: Transform data from array to object
          step = {};

          step.$project= {
            _id: 0,
            totalVisitorsPerBrowser: { $arrayToObject: "$totalVisitorsPerBrowser" }
          }

          visitorsPerBrowserQuery.push(step);

          promises.push(Visitor.aggregate(visitorsPerBrowserQuery));

          // endregion


          return Q.all(promises)
        })
        .then(function(result) {
          stats.totalVisitorsPerCountry = result[0][0].totalVisitorsPerCountry;
          stats.totalVisitorsPerBrowser = result[1][0].totalVisitorsPerBrowser;

          return reply({ stats });
        })
        .catch(function(error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        });


    };

    server.route({
      method: 'GET',
      path: '/stats/dashboard',
      config: {
        handler: dashboardStatsHandler,
        auth: null,
        description: 'Get stats for the dashboard.',
        tags: ['api', 'Stats', 'Dashboard'],
        validate: {
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
    });
  }());

};
