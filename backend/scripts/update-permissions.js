'use strict'

process.env.NODE_ENV = 'local'

const updatePermissions = require('../utilities/update-permissions.utility')

/**
 * A wrapper to run the update-permissions utility as a script.
 */
;(async function() {
  try {
    await updatePermissions()
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
