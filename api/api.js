'use strict';

const Hapi = require('hapi');
const config = require('../config').get('/restHapiConfig');
const Auth = require('./utilities/auth');
const mongoose = require('mongoose');
const restHapi = require('rest-hapi');
const Log = restHapi.getLogger('appy');

function apiInit() {

  const server = new Hapi.Server();

  server.connection({
    port: config.server.port,
    routes: {
      cors: {
        additionalHeaders: ['X-Total-Count'],
        additionalExposedHeaders: ['X-Total-Count']
      }
    }
  });

  restHapi.config = config;

  restHapi.generateModels(mongoose)
    .then(function () {
      server.register(require('hapi-auth-jwt2'), (err) => {
        if (err) {
          console.error('Failed to load plugin:', err);
        }

        server.register(require('hapi-auth-basic'), (err) => {
          if (err) {
            console.error('Failed to load plugin:', err);
          }

          Auth.getCurrentStrategy(server, Log);

          server.register(require('./utilities/mailer'), (err) => {
            if (err) {
              console.error('Failed to load plugin:', err);
            }
          });

          server.register({
            register: restHapi,
            options: {
              mongoose: mongoose
            }
          }, function (err) {
            if (err) {
              console.error('Failed to load plugin:', err);
            }

            server.start(function (err) {
              if (err) {
                console.error('Failed to start server:', err);
              }

              server.log('info', 'Server initialized: ' + server.info);

              restHapi.logUtil.logActionComplete(restHapi.logger, "Server Initialized", server.info);
            });
          });
        });
      });
    })
    .catch(function (error) {
      console.log("There was an error generating the models: ", error)
    });


  return server;
}

module.exports = apiInit();
