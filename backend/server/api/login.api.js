'use strict'

const Joi = require('joi')
const Boom = require('boom')
const Bcrypt = require('bcryptjs')
const Chalk = require('chalk')
const Jwt = require('jsonwebtoken')
const RestHapi = require('rest-hapi')

const Config = require('../../config')
const Token = require('../utilities/create-token')
const errorHelper = require('../utilities/error-helper')
const auditLog = require('../policies/audit-log.policy')

const AUTH_STRATEGIES = Config.get('/constants/AUTH_STRATEGIES')
const EXPIRATION_PERIOD = Config.get('/constants/EXPIRATION_PERIOD')
const WEB_TITLE = Config.get('/constants/WEB_TITLE')
const authStrategy = Config.get('/restHapiConfig/authStrategy')

module.exports = function(server, mongoose, logger) {
  /// /////////////////////
  // region LOGIN ENDPOINTS
  /// /////////////////////
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Login'))
    const AuthAttempt = mongoose.model('authAttempt')
    const Permission = mongoose.model('permission')
    const Session = mongoose.model('session')
    const User = mongoose.model('user')

    const loginPre = [
      {
        assign: 'abuseDetected',
        method: async function(request, h) {
          try {
            const ip = server.methods.getIP(request)
            const email = request.payload.email

            let detected = await AuthAttempt.abuseDetected(ip, email, Log)
            if (detected) {
              throw Boom.unauthorized(
                'Maximum number of auth attempts reached. Please try again later.'
              )
            }

            return h.continue
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      {
        assign: 'user',
        method: async function(request, h) {
          try {
            const email = request.payload.email
            const password = request.payload.password

            return await User.findByCredentials(email, password, Log)
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      {
        assign: 'logAttempt',
        method: async function(request, h) {
          try {
            if (request.pre.user) {
              return h.continue
            }
            const ip = server.methods.getIP(request)
            const email = request.payload.email

            await AuthAttempt.createInstance(ip, email, Log)

            throw Boom.unauthorized('Invalid Email or Password.')
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      {
        assign: 'isActive',
        method: function(request, h) {
          if (!request.pre.user.isActive) {
            throw Boom.unauthorized('Account is inactive.')
          }
          return h.continue
        }
      },
      {
        assign: 'isEnabled',
        method: function(request, h) {
          if (!request.pre.user.isEnabled) {
            throw Boom.unauthorized('Account is disabled.')
          }
          return h.continue
        }
      },
      {
        assign: 'isDeleted',
        method: function(request, h) {
          const user = request.pre.user

          if (user.isDeleted) {
            throw Boom.badRequest('Account is deleted.')
          }
          return h.continue
        }
      },
      {
        assign: 'session',
        method: async function(request, h) {
          try {
            if (authStrategy === AUTH_STRATEGIES.TOKEN) {
              return h.continue
            } else {
              return await Session.createInstance(request.pre.user, Log)
            }
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      {
        assign: 'scope',
        method: async function(request, h) {
          try {
            return await Permission.getScope(request.pre.user, Log)
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      {
        assign: 'standardToken',
        method: function(request, h) {
          switch (authStrategy) {
            case AUTH_STRATEGIES.TOKEN:
              return Token(
                request.pre.user,
                null,
                request.pre.scope,
                EXPIRATION_PERIOD.LONG,
                Log
              )
            case AUTH_STRATEGIES.SESSION:
              return h.continue
            case AUTH_STRATEGIES.REFRESH:
              return Token(
                request.pre.user,
                null,
                request.pre.scope,
                EXPIRATION_PERIOD.SHORT,
                Log
              )
            default:
              return h.continue
          }
        }
      },
      {
        assign: 'sessionToken',
        method: function(request, h) {
          switch (authStrategy) {
            case AUTH_STRATEGIES.TOKEN:
              return h.continue
            case AUTH_STRATEGIES.SESSION:
              return Token(
                null,
                request.pre.session,
                request.pre.scope,
                EXPIRATION_PERIOD.LONG,
                Log
              )
            case AUTH_STRATEGIES.REFRESH:
              return h.continue
            default:
              return h.continue
          }
        }
      },
      {
        assign: 'refreshToken',
        method: function(request, h) {
          switch (authStrategy) {
            case AUTH_STRATEGIES.TOKEN:
              return h.continue
            case AUTH_STRATEGIES.SESSION:
              return h.continue
            case AUTH_STRATEGIES.REFRESH:
              return Token(
                null,
                request.pre.session,
                request.pre.scope,
                EXPIRATION_PERIOD.LONG,
                Log
              )
            default:
              return h.continue
          }
        }
      }
    ]

    const loginHandler = function(request, h) {
      let accessToken = ''
      let response = {}

      request.pre.user.password = ''
      request.pre.user.pin = ''

      switch (authStrategy) {
        case AUTH_STRATEGIES.TOKEN:
          accessToken = request.pre.standardToken
          response = {
            user: request.pre.user,
            accessToken,
            scope: request.pre.scope
          }
          break
        case AUTH_STRATEGIES.SESSION:
          accessToken = request.pre.sessionToken
          response = {
            user: request.pre.user,
            accessToken,
            scope: request.pre.scope
          }
          break
        case AUTH_STRATEGIES.REFRESH:
          accessToken = request.pre.standardToken
          response = {
            user: request.pre.user,
            refreshToken: request.pre.refreshToken,
            accessToken,
            scope: request.pre.scope
          }
          break
        default:
          return h.continue
      }

      return response
    }

    // Login Endpoint
    ;(function() {
      Log.note('Generating Login endpoint')

      server.route({
        method: 'POST',
        path: '/login',
        config: {
          handler: loginHandler,
          auth: null,
          description: 'User login.',
          tags: ['api', 'Login'],
          validate: {
            payload: {
              email: Joi.string()
                .email()
                .lowercase()
                .required(),
              password: Joi.string().required()
            }
          },
          pre: loginPre,
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                { code: 200, message: 'Success' },
                { code: 400, message: 'Bad Request' },
                { code: 404, message: 'Not Found' },
                { code: 500, message: 'Internal Server Error' }
              ]
            },
            policies: [auditLog(mongoose, { payloadFilter: ['email'] }, Log)]
          }
        }
      })
    })()

    // Social Login Endpoint (for web)
    ;(function() {
      Log.note('Generating Social Login endpoint')

      const socialLoginPre = [
        {
          assign: 'decoded',
          method: async function(request, h) {
            try {
              let promise = new Promise((resolve, reject) => {
                Jwt.verify(
                  request.payload.token,
                  Config.get('/jwtSecret'),
                  function(err, decoded) {
                    if (err) {
                      Log.error(err)
                      reject(Boom.unauthorized('Invalid email or key.'))
                    }

                    resolve(decoded)
                  }
                )
              })

              return await promise
            } catch (err) {
              errorHelper.handleError(err, Log)
            }
          }
        },
        {
          assign: 'user',
          method: async function(request, h) {
            try {
              const conditions = {}

              if (request.pre.decoded.facebookId) {
                conditions.facebookId = request.pre.decoded.facebookId
              } else if (request.pre.decoded.googleId) {
                conditions.googleId = request.pre.decoded.googleId
              } else if (request.pre.decoded.githubId) {
                conditions.githubId = request.pre.decoded.githubId
              } else if (request.pre.decoded.email) {
                conditions.email = request.pre.decoded.email
              }

              conditions.isDeleted = false

              let user = await User.findOne(conditions)
              if (!user) {
                throw Boom.unauthorized('Invalid email or key.')
              }
              return user
            } catch (err) {
              errorHelper.handleError(err, Log)
            }
          }
        },
        {
          assign: 'isActive',
          method: function(request, h) {
            if (!request.pre.user.isActive) {
              throw Boom.unauthorized('Account is inactive.')
            }
            return h.continue
          }
        },
        {
          assign: 'isEnabled',
          method: function(request, h) {
            if (!request.pre.user.isEnabled) {
              throw Boom.unauthorized('Account is disabled.')
            }
            return h.continue
          }
        },
        {
          assign: 'isDeleted',
          method: function(request, h) {
            if (request.pre.user.isDeleted) {
              throw Boom.badRequest('Account is deleted.')
            }
            return h.continue
          }
        },
        {
          assign: 'session',
          method: async function(request, h) {
            try {
              if (authStrategy === AUTH_STRATEGIES.TOKEN) {
                return h.continue
              } else {
                return await Session.createInstance(request.pre.user, Log)
              }
            } catch (err) {
              errorHelper.handleError(err, Log)
            }
          }
        },
        {
          assign: 'scope',
          method: async function(request, h) {
            try {
              return await Permission.getScope(request.pre.user, Log)
            } catch (err) {
              errorHelper.handleError(err, Log)
            }
          }
        },
        {
          assign: 'standardToken',
          method: function(request, h) {
            switch (authStrategy) {
              case AUTH_STRATEGIES.TOKEN:
                return Token(
                  request.pre.user,
                  null,
                  request.pre.scope,
                  EXPIRATION_PERIOD.LONG,
                  Log
                )
              case AUTH_STRATEGIES.SESSION:
                return h.continue
              case AUTH_STRATEGIES.REFRESH:
                return Token(
                  request.pre.user,
                  null,
                  request.pre.scope,
                  EXPIRATION_PERIOD.SHORT,
                  Log
                )
              default:
                break
            }
          }
        },
        {
          assign: 'sessionToken',
          method: function(request, h) {
            switch (authStrategy) {
              case AUTH_STRATEGIES.TOKEN:
                return h.continue
              case AUTH_STRATEGIES.SESSION:
                return Token(
                  null,
                  request.pre.session,
                  request.pre.scope,
                  EXPIRATION_PERIOD.LONG,
                  Log
                )
              case AUTH_STRATEGIES.REFRESH:
                return h.continue
              default:
                break
            }
          }
        },
        {
          assign: 'refreshToken',
          method: function(request, h) {
            switch (authStrategy) {
              case AUTH_STRATEGIES.TOKEN:
                return h.continue
              case AUTH_STRATEGIES.SESSION:
                return h.continue
              case AUTH_STRATEGIES.REFRESH:
                return Token(
                  null,
                  request.pre.session,
                  request.pre.scope,
                  EXPIRATION_PERIOD.LONG,
                  Log
                )
              default:
                break
            }
          }
        }
      ]

      const socialLoginHandler = async function(request, h) {
        try {
          const key = request.pre.decoded.key
          const hash = request.pre.user.socialLoginHash

          let keyMatch = await Bcrypt.compare(key, hash)
          if (!keyMatch) {
            throw Boom.unauthorized('Invalid email or key.')
          }

          const _id = request.pre.user._id
          const update = {
            $unset: {
              socialLoginHash: undefined
            }
          }

          let user = await RestHapi.update(User, _id, update, Log)

          let accessToken = ''
          let response = {}

          switch (authStrategy) {
            case AUTH_STRATEGIES.TOKEN:
              accessToken = 'Bearer ' + request.pre.standardToken
              response = {
                user: user,
                accessToken,
                scope: request.pre.scope
              }
              break
            case AUTH_STRATEGIES.SESSION:
              accessToken = 'Bearer ' + request.pre.sessionToken
              response = {
                user: user,
                accessToken,
                scope: request.pre.scope
              }
              break
            case AUTH_STRATEGIES.REFRESH:
              accessToken = 'Bearer ' + request.pre.standardToken
              response = {
                user: user,
                refreshToken: request.pre.refreshToken,
                accessToken,
                scope: request.pre.scope
              }
              break
            default:
              break
          }

          return response
        } catch (err) {
          errorHelper.handleError(err, Log)
        }
      }

      server.route({
        method: 'POST',
        path: '/login/social',
        config: {
          handler: socialLoginHandler,
          auth: false,
          description: 'Social login.',
          tags: ['api', 'Login', 'Social Login'],
          validate: {
            payload: {
              token: Joi.string().required()
            }
          },
          pre: socialLoginPre,
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
  })(
    /// /////////////////////
    // endregion
    /// /////////////////////

    // Forgot Password Endpoint
    (function() {
      const Log = logger.bind(Chalk.magenta('Forgot Password'))
      const User = mongoose.model('user')
      const Session = mongoose.model('session')

      Log.note('Generating Forgot Password endpoint')

      const forgotPasswordPre = [
        {
          assign: 'user',
          method: async function(request, h) {
            try {
              const conditions = {
                email: request.payload.email
              }

              let user = await User.findOne(conditions)
              // NOTE: For more secure applications, the server should respond with a success even if the user isn't found
              // since this reveals the existence of an account. For more information, refer to the links below:
              // https://postmarkapp.com/guides/password-reset-email-best-practices
              // https://security.stackexchange.com/questions/40694/disclose-to-user-if-account-exists
              if (!user) {
                throw Boom.notFound('User not found.')
              }
              return user
            } catch (err) {
              errorHelper.handleError(err, Log)
            }
          }
        }
      ]

      const forgotPasswordHandler = async function(request, h) {
        try {
          const mailer = request.server.plugins.mailer

          let keyHash = {}
          let user = {}
          let pinRequired = true
          if (request.auth.credentials) {
            pinRequired = !request.auth.credentials.scope.filter(function(
              scope
            ) {
              return scope === 'root' || scope === 'resetPasswordNoPin'
            })[0]
          }

          keyHash = await Session.generateKeyHash(Log)

          const _id = request.pre.user._id.toString()
          const update = {
            resetPassword: {
              hash: keyHash.hash,
              pinRequired
            }
          }

          user = await RestHapi.update(User, _id, update)

          const firstName = user.firstName ? user.firstName : null
          const lastName = user.lastName ? user.lastName : null

          const emailOptions = {
            subject: 'Reset your ' + WEB_TITLE + ' password',
            to: {
              name: firstName + ' ' + lastName,
              address: request.payload.email
            }
          }

          const template = 'forgot-password'

          const token = Jwt.sign(
            {
              email: request.payload.email,
              key: keyHash.key
            },
            Config.get('/jwtSecret'),
            { algorithm: 'HS256', expiresIn: EXPIRATION_PERIOD.MEDIUM }
          )

          const context = {
            clientURL: Config.get('/clientURL'),
            websiteName: WEB_TITLE,
            key: token,
            pinRequired
          }

          await mailer.sendEmail(emailOptions, template, context, Log)

          return { message: 'Success.' }
        } catch (err) {
          errorHelper.handleError(err, Log)
        }
      }

      server.route({
        method: 'POST',
        path: '/login/forgot',
        config: {
          handler: forgotPasswordHandler,
          auth: {
            strategy: authStrategy,
            mode: 'try'
          },
          description: 'Forgot password.',
          tags: ['api', 'Login', 'Forgot Password'],
          validate: {
            payload: {
              email: Joi.string()
                .email()
                .required()
            }
          },
          pre: forgotPasswordPre,
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                { code: 200, message: 'Success' },
                { code: 400, message: 'Bad Request' },
                { code: 404, message: 'Not Found' },
                { code: 500, message: 'Internal Server Error' }
              ]
            },
            policies: [auditLog(mongoose, {}, Log)]
          }
        }
      })
    })()
  )

  // Reset Password Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Reset Password'))
    const User = mongoose.model('user')

    Log.note('Generating Reset Password endpoint')

    const resetPasswordPre = [
      {
        assign: 'decoded',
        method: async function(request, h) {
          let promise = new Promise((resolve, reject) => {
            Jwt.verify(
              request.payload.token,
              Config.get('/jwtSecret'),
              function(err, decoded) {
                if (err) {
                  Log.error(err)
                  reject(Boom.unauthorized('Invalid token.'))
                }

                resolve(decoded)
              }
            )
          })

          return promise
        }
      },
      {
        assign: 'user',
        method: async function(request, h) {
          try {
            const conditions = {
              email: request.pre.decoded.email,
              isDeleted: false
            }

            let user = await User.findOne(conditions)
            if (!user || !user.resetPassword) {
              throw Boom.unauthorized('Invalid email or key.')
            }
            return user
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      {
        assign: 'checkPIN',
        method: async function(request, h) {
          try {
            // A PIN is not required if the SuperAdmin initiated the password reset
            if (request.pre.user.resetPassword.pinRequired) {
              if (!request.payload.pin) {
                throw Boom.unauthorized('PIN required.')
              }
              const key = request.payload.pin
              const hash = request.pre.user.pin
              let keyMatch = await Bcrypt.compare(key, hash)

              if (!keyMatch) {
                throw Boom.unauthorized('Invalid PIN.')
              }
              return keyMatch
            } else {
              return true
            }
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      }
    ]

    const resetPasswordHandler = async function(request, h) {
      try {
        const key = request.pre.decoded.key
        const resetPassword = request.pre.user.resetPassword
        let keyMatch = await Bcrypt.compare(key, resetPassword.hash)
        if (!keyMatch) {
          throw Boom.unauthorized('Invalid email or key.')
        }

        let passwordHash = await User.generateHash(
          request.payload.password,
          Log
        )

        const _id = request.pre.user._id.toString()
        const update = {
          $set: {
            password: passwordHash.hash
          },
          $unset: {
            resetPassword: undefined
          }
        }

        await RestHapi.update(User, _id, update)

        return { message: 'Success.' }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'POST',
      path: '/login/reset',
      config: {
        handler: resetPasswordHandler,
        auth: null,
        description: 'Reset password.',
        tags: ['api', 'Login', 'Reset Password'],
        validate: {
          payload: {
            token: Joi.string().required(),
            password: Joi.string().required(),
            pin: Joi.string()
              .allow(null)
              .required()
          }
        },
        pre: resetPasswordPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [auditLog(mongoose, { payloadFilter: ['token'] }, Log)]
        }
      }
    })
  })()
}
