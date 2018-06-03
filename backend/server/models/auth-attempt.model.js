'use strict'

const Config = require('../../config')
const errorHelper = require('../utilities/errorHelper')

module.exports = function(mongoose) {
  const modelName = 'authAttempt'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
    {
      email: {
        type: Types.String,
        required: true
      },
      ip: {
        type: Types.String,
        required: true
      },
      time: {
        type: Types.Date,
        required: true
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      alias: 'auth-attempt'
    },
    createInstance: async function(ip, email, Log) {
      try {
        const document = {
          ip,
          email: email.toLowerCase(),
          time: new Date()
        }

        return await mongoose.model('authAttempt').create(document)
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    },

    abuseDetected: async function(ip, email, Log) {
      try {
        const self = this

        const LOCKOUT_PERIOD = Config.get('/constants/LOCKOUT_PERIOD')
        const expirationDate = LOCKOUT_PERIOD
          ? { $gt: Date.now() - LOCKOUT_PERIOD * 60000 }
          : { $lt: Date.now() }

        let query = {
          ip,
          time: expirationDate
        }

        const abusiveIpCount = await self.count(query)
        query = {
          ip,
          email: email.toLowerCase(),
          time: expirationDate
        }

        const abusiveIpUserCount = await self.count(query)

        const AUTH_ATTEMPTS = Config.get('/constants/AUTH_ATTEMPTS')
        const ipLimitReached = abusiveIpCount >= AUTH_ATTEMPTS.FOR_IP
        const ipUserLimitReached =
          abusiveIpUserCount >= AUTH_ATTEMPTS.FOR_IP_AND_USER

        return ipLimitReached || ipUserLimitReached
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }
  }

  return Schema
}
