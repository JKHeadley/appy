'use strict';
const Confidence = require('confidence');
const Config = require('./config');


const criteria = {
  env: process.env.NODE_ENV
};

console.log("ENV:", process.env.NODE_ENV)
console.log("EMAIL:", Config.get('/defaultEmail'))
console.log("URL:", Config.get('/clientURL'))
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD)


const manifest = {
  $meta: 'This file defines the server.',
  server: {
    debug: {
      request: ['error']
    },
    connections: {
      routes: {
        security: true,
        cors: true
      }
    }
  },
  connections: [{
    port: Config.get('/port')
  }],
  registrations: [
    {
      plugin: 'hapi-auth-jwt2'
    },
    {
      plugin: 'bell'
    },
    {
      plugin: 'hapi-geo-locate'
    },
    {
      plugin: './server/mailer'
    },
    {
      plugin: './server/auth'
    },
    {
      plugin: './server/sockets'
    },
    {
      plugin: './server/api'
    },
  ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

  return store.get(key, criteria);
};


exports.meta = function (key) {

  return store.meta(key, criteria);
};
