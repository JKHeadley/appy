'use strict'
const Confidence = require('confidence')
const Config = require('./config')

const criteria = {
  env: process.env.NODE_ENV
}

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
  connections: [
    {
      port: Config.get('/port')
    }
  ],
  registrations: [
    {
      plugin: 'hapi-auth-jwt2'
    },
    {
      plugin: 'bell'
    },
    {
      plugin: './server/plugins/mailer'
    },
    {
      plugin: './server/plugins/auth'
    },
    {
      plugin: './server/plugins/sockets'
    },
    {
      plugin: './server/plugins/api'
    }
  ]
}

const store = new Confidence.Store(manifest)

exports.get = function(key) {
  return store.get(key, criteria)
}

exports.meta = function(key) {
  return store.meta(key, criteria)
}
