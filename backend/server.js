'use strict';

const RestHapi = require('rest-hapi');
const Composer = require('./index');

Composer((err, server) => {

  if (err) {
    throw err;
  }

  server.start(() => {
    RestHapi.logUtil.logActionComplete(RestHapi.logger, "Server Initialized", server.info);
  });
});
