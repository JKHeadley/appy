'use strict'
const Glue = require('@hapi/glue')
const RestHapi = require('rest-hapi')
const Manifest = require('./config/manifest.conf')

const composeOptions = {
  relativeTo: __dirname
}

const startServer = async function() {
  try {
    const manifest = Manifest.get('/')
    const server = await Glue.compose(manifest, composeOptions)

    await server.start()

    RestHapi.logUtil.logActionComplete(
      RestHapi.logger,
      'Server Initialized',
      server.info
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startServer()
