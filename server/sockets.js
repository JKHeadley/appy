'use strict';

const nes = require('nes');

const Config = require('../config');

const authStrategy = Config.get('/restHapiConfig/authStrategy');

exports.register = function (server, options, next) {

  server.register({
    register: nes,
    options: {
      auth: {
        type: 'direct',
        route: {
          strategy: authStrategy
        }
      },
      onConnection: function (socket) {
        console.log("connection established:", socket.auth)
      }
    }
  }, function (err) {
    if (err) {
      console.error('Failed to load plugin:', err);
    }

    next();
  });

};

exports.register.attributes = {
  name: 'sockets'
};
