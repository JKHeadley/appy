'use strict'

const Boom = require('boom')
const Chalk = require('chalk')
const Jwt = require('jsonwebtoken')
const Uuid = require('node-uuid')
const Q = require('q')
const RestHapi = require('rest-hapi')

const Config = require('../../config/config')

const USER_ROLES = Config.get('/constants/USER_ROLES')
const clientURL = Config.get('/clientURL')

module.exports = function(server, mongoose, logger) {
  /**
   * Shared handler for social auth endpoints. First endpoint to hit for social login with web.
   */
  const socialAuthHandler = function(request, reply) {
    const Log = logger.bind(Chalk.magenta('Social Auth'))
    const User = mongoose.model('user')

    if (!request.auth.isAuthenticated) {
      return reply(
        Boom.unauthorized(
          'Authentication failed: ' + request.auth.error.message
        )
      )
    }

    const tokenPayload = {
      email: request.pre.user.email,
      facebookId: request.pre.user.facebookId,
      googelId: request.pre.user.googelId,
      githubId: request.pre.user.githubId,
      key: request.pre.keyHash.key
    }

    // NOTE: this token has a very short lifespan as it should be used immediately under correct conditions
    const token = Jwt.sign(tokenPayload, Config.get('/jwtSecret'), {
      algorithm: 'HS256',
      expiresIn: '1m'
    })

    const _id = request.pre.user._id

    const update = {
      socialLoginHash: request.pre.keyHash.hash
    }

    // We update the user's social Id just in case they didn't have one yet
    if (request.pre.user.facebookId) {
      update.facebookId = request.pre.user.facebookId
    }
    if (request.pre.user.googleId) {
      update.googleId = request.pre.user.googleId
    }
    if (request.pre.user.githubId) {
      update.githubId = request.pre.user.githubId
    }

    return RestHapi.update(User, _id, update, Log)
      .then(function(user) {
        const redirectUrl = clientURL + '/login/social'
        return reply.redirect(redirectUrl + '/?token=' + token)
      })
      .catch(function(error) {
        Log.error(error)
        return reply(Boom.gatewayTimeout('An error occurred.'))
      })
  }

  // Facebook Auth Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Facebook Auth'))
    const Session = mongoose.model('session')
    const User = mongoose.model('user')
    const Role = mongoose.model('role')

    Log.note('Generating Facebook Auth endpoint')

    const facebookAuthPre = [
      {
        assign: 'user',
        method: function(request, reply) {
          const facebookProfile = request.auth.credentials.profile

          let user = {}
          let password = {}

          let promises = []
          // if the user does not exist, we create one with the facebook account data
          promises.push(User.findOne({ email: facebookProfile.email }))
          promises.push(User.findOne({ facebookId: facebookProfile.id }))
          return Q.all(promises)
            .then(function(result) {
              user = result[0] ? result[0] : result[1]
              if (user) {
                user.facebookId = facebookProfile.id
                reply(user)

                throw new Error('Found User')
              } else {
                return RestHapi.list(Role, { name: USER_ROLES.USER }, Log)
              }
            })
            .then(function(role) {
              role = role.docs[0]

              password = Uuid.v4()
              user = {
                isActive: true,
                email: facebookProfile.email,
                firstName: facebookProfile.name.first,
                lastName: facebookProfile.name.last,
                profileImageUrl:
                  'https://graph.facebook.com/' +
                  facebookProfile.id +
                  '/picture?type=large',
                password: password,
                facebookId: facebookProfile.id,
                role: role._id
              }

              // We use the actual endpoint to take advantage of policies. Specifically in this case we need to
              // take advantage of duplicate fields so that roleName and roleRank are populated.
              // (see: https://github.com/JKHeadley/rest-hapi#policies-vs-middleware)
              let request = {
                method: 'POST',
                url: '/user',
                params: {},
                query: {},
                payload: user,
                credentials: { scope: ['root', USER_ROLES.SUPER_ADMIN] },
                headers: { authorization: 'Bearer' }
              }

              let injectOptions = RestHapi.testHelper.mockInjection(request)

              return server.inject(injectOptions)
            })
            .then(function(result) {
              user = result.result

              user.password = password

              return reply(user)
            })
            .catch(function(error) {
              if (error.message === 'Found User') {
                return
              }
              Log.error(error)
              return reply(Boom.gatewayTimeout('An error occurred.'))
            })
        }
      },
      {
        assign: 'keyHash',
        method: function(request, reply) {
          Session.generateKeyHash(Log)
            .then(function(result) {
              return reply(result)
            })
            .catch(function(error) {
              Log.error(error)
              return reply(Boom.gatewayTimeout('An error occurred.'))
            })
        }
      }
    ]

    server.route({
      method: 'GET',
      path: '/auth/facebook',
      config: {
        handler: socialAuthHandler,
        auth: 'facebook',
        description: 'Facebook auth.',
        tags: ['api', 'Facebook', 'Auth'],
        validate: {},
        pre: facebookAuthPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          }
        }
      }
    })
  })()

  // Google Auth Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Google Auth'))
    const Session = mongoose.model('session')
    const User = mongoose.model('user')
    const Role = mongoose.model('role')

    Log.note('Generating Google Auth endpoint')

    const googleAuthPre = [
      {
        assign: 'user',
        method: function(request, reply) {
          const googleProfile = request.auth.credentials.profile

          let user = {}
          let password = {}

          let promises = []
          // if the user does not exist, we create one with the google account data
          promises.push(User.findOne({ email: googleProfile.email }))
          promises.push(User.findOne({ googleId: googleProfile.id }))
          return Q.all(promises)
            .then(function(result) {
              user = result[0] ? result[0] : result[1]
              if (user) {
                user.googleId = googleProfile.id
                reply(user)

                throw new Error('Found User')
              } else {
                return RestHapi.list(Role, { name: USER_ROLES.USER }, Log)
              }
            })
            .then(function(role) {
              role = role.docs[0]

              password = Uuid.v4()
              user = {
                isActive: true,
                email: googleProfile.email,
                firstName: googleProfile.name.given_name,
                lastName: googleProfile.name.family_name,
                profileImageUrl: googleProfile.raw.picture,
                password: password,
                googleId: googleProfile.id,
                role: role._id
              }

              // We use the actual endpoint to take advantage of policies. Specifically in this case we need to
              // take advantage of duplicate fields so that roleName and roleRank are populated.
              // (see: https://github.com/JKHeadley/rest-hapi#policies-vs-middleware)
              let request = {
                method: 'POST',
                url: '/user',
                params: {},
                query: {},
                payload: user,
                credentials: { scope: ['root', USER_ROLES.SUPER_ADMIN] },
                headers: { authorization: 'Bearer' }
              }

              let injectOptions = RestHapi.testHelper.mockInjection(request)

              return server.inject(injectOptions)
            })
            .then(function(result) {
              user = result.result

              user.password = password

              return reply(user)
            })
            .catch(function(error) {
              Log.debug('ERROR:', error)
              if (error.message === 'Found User') {
                return
              }
              Log.error(error)
              return reply(Boom.gatewayTimeout('An error occurred.'))
            })
        }
      },
      {
        assign: 'keyHash',
        method: function(request, reply) {
          Session.generateKeyHash(Log)
            .then(function(result) {
              return reply(result)
            })
            .catch(function(error) {
              Log.error(error)
              return reply(Boom.gatewayTimeout('An error occurred.'))
            })
        }
      }
    ]

    server.route({
      method: 'GET',
      path: '/auth/google',
      config: {
        handler: socialAuthHandler,
        auth: 'google',
        description: 'Google auth.',
        tags: ['api', 'Google', 'Auth'],
        validate: {},
        pre: googleAuthPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          }
        }
      }
    })
  })()

  // Github Auth Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Github Auth'))
    const Session = mongoose.model('session')
    const User = mongoose.model('user')
    const Role = mongoose.model('role')

    Log.note('Generating Github Auth endpoint')

    const githubAuthPre = [
      {
        assign: 'user',
        method: function(request, reply) {
          const githubProfile = request.auth.credentials.profile

          let user = {}
          let password = {}

          let promises = []
          // if the user does not exist, we create one with the github account data
          promises.push(User.findOne({ email: githubProfile.email }))
          promises.push(User.findOne({ githubId: githubProfile.id }))
          return Q.all(promises)
            .then(function(result) {
              user = result[0] ? result[0] : result[1]
              if (user) {
                user.githubId = githubProfile.id
                reply(user)

                throw new Error('Found User')
              } else {
                return RestHapi.list(Role, { name: USER_ROLES.USER }, Log)
              }
            })
            .then(function(role) {
              role = role.docs[0]

              let name = githubProfile.displayName.split(' ')
              let firstName = name[0]
              let lastName = name[name.length - 1]

              password = Uuid.v4()
              user = {
                isActive: true,
                email: githubProfile.email || 'noreply@appy.io',
                firstName,
                lastName,
                profileImageUrl: githubProfile.raw.avatar_url,
                password: password,
                githubId: githubProfile.id.toString(),
                role: role._id
              }

              // We use the actual endpoint to take advantage of policies. Specifically in this case we need to
              // take advantage of duplicate fields so that roleName and roleRank are populated.
              // (see: https://github.com/JKHeadley/rest-hapi#policies-vs-middleware)
              let request = {
                method: 'POST',
                url: '/user',
                params: {},
                query: {},
                payload: user,
                credentials: { scope: ['root', USER_ROLES.SUPER_ADMIN] },
                headers: { authorization: 'Bearer' }
              }

              let injectOptions = RestHapi.testHelper.mockInjection(request)

              return server.inject(injectOptions)
            })
            .then(function(result) {
              user = result.result

              user.password = password

              return reply(user)
            })
            .catch(function(error) {
              if (error.message === 'Found User') {
                return
              }
              Log.error(error)
              return reply(Boom.gatewayTimeout('An error occurred.'))
            })
        }
      },
      {
        assign: 'keyHash',
        method: function(request, reply) {
          Session.generateKeyHash(Log)
            .then(function(result) {
              return reply(result)
            })
            .catch(function(error) {
              Log.error(error)
              return reply(Boom.gatewayTimeout('An error occurred.'))
            })
        }
      }
    ]

    server.route({
      method: 'GET',
      path: '/auth/github',
      config: {
        handler: socialAuthHandler,
        auth: 'github',
        description: 'Github auth.',
        tags: ['api', 'Github', 'Auth'],
        validate: {},
        pre: githubAuthPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          }
        }
      }
    })
  })()
}
