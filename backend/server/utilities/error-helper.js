'use strict'
let Boom = require('@hapi/boom')

function handleError(err, Log) {
  if (err.isBoom) {
    throw err
  } else {
    Log.error(err)
    throw Boom.badImplementation(err)
  }
}

module.exports = {
  handleError
}
