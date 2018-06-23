'use strict'
const Confidence = require('confidence')
const Config = require('./index')
const RestHapi = require('rest-hapi')

const criteria = {
  env: process.env.NODE_ENV
}

const manifest = {
  $meta: 'This file defines the server.',
  server: {
    // debug: {
    //   request: ['error']
    // },
    port: Config.get('/port'),
    // connections: {
    //   routes: {
    //     security: true,
    //     cors: true
    //   }
    // }
    routes: {
      cors: {
        origin: ['*']
      },
      validate: {
        failAction: async (request, h, err) => {
          RestHapi.logger.error(err)
          throw err
        }
      }
    }
  },
  // connections: [
  //   {
  //     port: Config.get('/port')
  //   }
  // ],
  register: {
    plugins: [
      {
        plugin: 'hapi-auth-jwt2'
      },
      {
        plugin: 'bell'
      },
      {
        plugin: './server/plugins/mailer.plugin'
      },
      {
        plugin: './server/plugins/auth.plugin'
      },
      {
        plugin: './server/plugins/sockets.plugin'
      },
      {
        plugin: './server/plugins/api.plugin'
      }
    ]
  }
}

const store = new Confidence.Store(manifest)

exports.get = function(key) {
  return store.get(key, criteria)
}

exports.meta = function(key) {
  return store.meta(key, criteria)
}
