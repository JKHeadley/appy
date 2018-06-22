'use strict'

process.env.NODE_ENV = 'local'

const mongoose = require('mongoose')
const RestHapi = require('rest-hapi')

/**
 * Drops all of the base collections. Typically before seeding.
 * @param models
 * @returns {*}
 */
async function dropCollections(models) {
  RestHapi.config.loglevel = 'LOG'
  const Log = RestHapi.getLogger('unseed')

  try {
    Log.log('removing users')
    await models.user.remove({})
    Log.log('removing roles')
    await models.role.remove({})
    Log.log('removing groups')
    await models.group.remove({})
    Log.log('removing permissions')
    await models.permission.remove({})
    Log.log('removing sessions')
    await models.session.remove({})
    Log.log('removing authAttempts')
    await models.authAttempt.remove({})
    Log.log('removing connections')
    await models.connection.remove({})
    Log.log('removing documents')
    await models.document.remove({})
    Log.log('removing images')
    await models.image.remove({})
    Log.log('removing visitors')
    await models.visitor.remove({})
    Log.log('removing group_permission')
    await mongoose.model('group_permission').remove({})
    Log.log('removing group_user')
    await mongoose.model('group_user').remove({})
    Log.log('removing role_permission')
    await mongoose.model('role_permission').remove({})
    Log.log('removing user_permission')
    await mongoose.model('user_permission').remove({})
    Log.log('removing user_conversation')
    await mongoose.model('user_conversation').remove({})
    Log.log('removing user_document')
    await mongoose.model('user_document').remove({})
  } catch (err) {
    Log.error(err)
    throw err
  }
}

module.exports = dropCollections
