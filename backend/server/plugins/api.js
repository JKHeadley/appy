'use strict'

const mongoose = require('mongoose')
const RestHapi = require('rest-hapi')

const Config = require('../../config/config')

module.exports = {
  plugin: {
    name: 'api',
    register
  }
}

async function register(server, options) {
  try {
    await server.register({
      plugin: RestHapi,
      options: {
        mongoose,
        config: Config.get('/restHapiConfig')
      }
    })
  } catch (err) {
    console.error('Failed to load plugin:', err)
  }
}
