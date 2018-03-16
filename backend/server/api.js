'use strict';

const Mongoose = require('mongoose');
const RestHapi = require('rest-hapi');

const Config = require('../config');

exports.register = function (server, options, next) {
  RestHapi.config = Config.get('/restHapiConfig');

  server.register({
    register: RestHapi,
    options: {
      mongoose: Mongoose
    }
  }, function (err) {
    if (err) {
      console.error('Failed to load plugin:', err);
    }

    next();
  });

};

exports.register.attributes = {
  name: 'api'
};
