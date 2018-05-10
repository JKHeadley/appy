'use strict'

const Config = require('../../config/config')

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
    createInstance: function(ip, email, Log) {
      const document = {
        ip,
        email: email.toLowerCase(),
        time: new Date()
      }

      return mongoose
        .model('authAttempt')
        .create(document)
        .then(function(docs) {
          return docs
        })
    },

    abuseDetected: function(ip, email, Log) {
      const self = this

      const LOCKOUT_PERIOD = Config.get('/constants/LOCKOUT_PERIOD')
      const expirationDate = LOCKOUT_PERIOD
        ? { $gt: Date.now() - LOCKOUT_PERIOD * 60000 }
        : { $lt: Date.now() }

      let abusiveIpCount = {}
      let abusiveIpUserCount = {}

      const query = {
        ip,
        time: expirationDate
      }

      return self
        .count(query)
        .then(function(result) {
          abusiveIpCount = result

          const query = {
            ip,
            email: email.toLowerCase(),
            time: expirationDate
          }

          return self.count(query)
        })
        .then(function(result) {
          abusiveIpUserCount = result

          const AUTH_ATTEMPTS = Config.get('/constants/AUTH_ATTEMPTS')
          const ipLimitReached = abusiveIpCount >= AUTH_ATTEMPTS.FOR_IP
          const ipUserLimitReached =
            abusiveIpUserCount >= AUTH_ATTEMPTS.FOR_IP_AND_USER

          return ipLimitReached || ipUserLimitReached
        })
    }
  }

  return Schema
}
