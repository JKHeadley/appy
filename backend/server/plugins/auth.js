'use strict'

const Mongoose = require('mongoose')
const Boom = require('boom')
const RestHapi = require('rest-hapi')
const errorHelper = require('../utilities/errorHelper')

const Config = require('../../config/config')
const Token = require('../utilities/token')

const AUTH_STRATEGIES = Config.get('/constants/AUTH_STRATEGIES')
const socialPassword = Config.get('/socialPassword')
const socialIds = Config.get('/socialIds')
const socialSecrets = Config.get('/socialSecrets')
const EXPIRATION_PERIOD = Config.get('/constants/EXPIRATION_PERIOD')
const isSecure = Config.get('/socialSecure')

const logger = RestHapi.getLogger('appy')

const internals = {}

module.exports = {
  plugin: {
    name: 'auth',
    register
  }
}

internals.applyTokenStrategy = function(server) {
  // const Log = logger.bind('auth/standard-jwt')

  server.auth.strategy(AUTH_STRATEGIES.TOKEN, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validate: function(decodedToken, request, callback) {
      let user = decodedToken.user

      callback(null, Boolean(user), { user, scope: decodedToken.scope })
    }
  })
}

internals.applySessionStrategy = function(server) {
  const Log = logger.bind('auth/session')

  server.ext('onPostHandler', function(request, h) {
    const creds = request.auth.credentials

    // send a fresh token in the response
    if (creds && request.response.header) {
      request.response.header(
        'X-Access-Token',
        Token(null, creds.session, creds.scope, EXPIRATION_PERIOD.LONG, Log)
      )
    }

    return h.continue
  })

  server.auth.strategy(AUTH_STRATEGIES.SESSION, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validate: function(decodedToken, request, callback) {
      const Session = Mongoose.model('session')
      const User = Mongoose.model('user')

      const sessionId = decodedToken.sessionId
      const sessionKey = decodedToken.sessionKey
      const passwordHash = decodedToken.passwordHash
      const scope = decodedToken.scope
      let session = {}
      let user = {}

      Session.findByCredentials(sessionId, sessionKey, Log)
        .then(function(result) {
          session = result

          if (!session) {
            return callback(null, false)
          }

          return User.findById(session.user)
        })
        .then(function(result) {
          if (result === false) {
            return result
          }
          user = result

          if (!user) {
            return callback(null, false)
          }

          if (user.password !== passwordHash) {
            return callback(null, false)
          }

          callback(null, Boolean(user), { session, user, scope: scope })
        })
        .catch(function(error) {
          Log.error(error)
        })
    }
  })
}

internals.applyRefreshStrategy = function(server) {
  const Log = logger.bind('auth/refresh')

  server.ext('onPostHandler', function(request, h) {
    const creds = request.auth.credentials

    // if the auth credentials contain session info (i.e. a refresh token), respond with a fresh set of tokens in the header.
    if (creds && creds.session && request.response.header) {
      request.response.header(
        'X-Access-Token',
        Token(creds.user, null, creds.scope, EXPIRATION_PERIOD.SHORT, Log)
      )
      request.response.header(
        'X-Refresh-Token',
        Token(null, creds.session, creds.scope, EXPIRATION_PERIOD.LONG, Log)
      )
    }

    return h.continue
  })

  server.auth.strategy(AUTH_STRATEGIES.REFRESH, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'], ignoreExpiration: true },
    validate: async function(decodedToken, request, h) {
      try {
        // if the token is expired, respond with token type so the client can switch to refresh token if necessary
        if (decodedToken.exp < Math.floor(Date.now() / 1000)) {
          if (decodedToken.user) {
            throw Boom.unauthorized('Expired Access Token', 'Token', null)
          } else {
            throw Boom.unauthorized('Expired Refresh Token', 'Token', null)
          }
        }

        let user = {}
        let session = {}

        // If the token does not contain session info, then simply authenticate and continue
        if (decodedToken.user) {
          user = decodedToken.user

          return {
            isValid: true,
            credentials: { user, scope: decodedToken.scope }
          }
        }
        // If the token does contain session info (i.e. a refresh token), then use the session to
        // authenticate and respond with a fresh set of tokens in the header
        else if (decodedToken.sessionId) {
          const Session = Mongoose.model('session')
          const User = Mongoose.model('user')

          session = await Session.findByCredentials(
            decodedToken.sessionId,
            decodedToken.sessionKey,
            Log
          )
          if (!session) {
            return { isValid: false }
          }

          let user = await User.findById(session.user)

          if (!user) {
            return { isValid: false }
          }

          if (user.password !== decodedToken.passwordHash) {
            return { isValid: false }
          }

          return {
            isValid: true,
            credentials: {
              user,
              session,
              scope: decodedToken.scope
            }
          }
        }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }
  })
}

internals.applyFacebookStrategy = function(server) {
  const facebookOptions = {
    provider: 'facebook',
    password: socialPassword,
    clientId: socialIds.facebook,
    clientSecret: socialSecrets.facebook,
    forceHttps: isSecure,
    isSecure // Should be set to true (which is the default) in production
  }

  // Setup the social Facebook login strategy
  server.auth.strategy('facebook', 'bell', facebookOptions)
}

internals.applyGoogleStrategy = function(server) {
  const googleOptions = {
    provider: 'google',
    password: socialPassword,
    clientId: socialIds.google,
    clientSecret: socialSecrets.google,
    forceHttps: isSecure,
    isSecure // Should be set to true (which is the default) in production
  }

  // Setup the social Google login strategy
  server.auth.strategy('google', 'bell', googleOptions)
}

internals.applyGithubStrategy = function(server) {
  const googleOptions = {
    provider: 'github',
    password: socialPassword,
    clientId: socialIds.github,
    clientSecret: socialSecrets.github,
    forceHttps: isSecure,
    isSecure // Should be set to true (which is the default) in production
  }

  // Setup the social GitHub login strategy
  server.auth.strategy('github', 'bell', googleOptions)
}

internals.customForbiddenMessage = function(server) {
  server.ext('onPreResponse', (request, h) => {
    const response = request.response

    if (
      response.output &&
      response.output.statusCode === 403 &&
      response.output.payload &&
      response.output.payload.message === 'Insufficient scope'
    ) {
      response.output.payload.message = 'Insufficient permissions'
    }

    return h.continue
  })
}

async function register(server, options) {
  const authStrategy = Config.get('/restHapiConfig/authStrategy')

  internals.customForbiddenMessage(server)

  internals.applyFacebookStrategy(server)
  internals.applyGoogleStrategy(server)
  internals.applyGithubStrategy(server)

  switch (authStrategy) {
    case AUTH_STRATEGIES.TOKEN:
      internals.applyTokenStrategy(server)
      break
    case AUTH_STRATEGIES.SESSION:
      internals.applySessionStrategy(server)
      break
    case AUTH_STRATEGIES.REFRESH:
      internals.applyRefreshStrategy(server)
      break
    default:
      break
  }

  // Add helper method to get request ip
  const getIP = function(request) {
    // We check the headers first in case the server is behind a reverse proxy.
    // see: https://ypereirareis.github.io/blog/2017/02/15/nginx-real-ip-behind-nginx-reverse-proxy/
    return (
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.info.remoteAddress
    )
  }
  server.method('getIP', getIP, {})
}
