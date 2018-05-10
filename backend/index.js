'use strict'
const Glue = require('glue')
const RestHapi = require('rest-hapi')
const Manifest = require('./server/config/manifest')

const composeOptions = {
  relativeTo: __dirname
}

const Composer = Glue.compose.bind(Glue, Manifest.get('/'), composeOptions)

Composer((err, server) => {
  if (err) {
    throw err
  }

  server.start(() => {
    RestHapi.logUtil.logActionComplete(
      RestHapi.logger,
      'Server Initialized',
      server.info
    )
  })
})
