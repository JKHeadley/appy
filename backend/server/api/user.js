'use strict'

const Joi = require('joi')
const Boom = require('boom')
const Chalk = require('chalk')
const _ = require('lodash')
const zxcvbn = require('zxcvbn')
const Q = require('q')
const RestHapi = require('rest-hapi')

const Config = require('../config/config')
const auditLog = require('../policies/audit-log')

const USER_ROLES = Config.get('/constants/USER_ROLES')
const REQUIRED_PASSWORD_STRENGTH = Config.get(
  '/constants/REQUIRED_PASSWORD_STRENGTH'
)
const authStrategy = Config.get('/restHapiConfig/authStrategy')

const rankAuth = require('../policies/roleAuth').rankAuth

const enableDemoAuth = Config.get('/enableDemoAuth')
const demoAuth = enableDemoAuth ? 'demoAuth' : null
const demoUser = enableDemoAuth ? 'demoUser' : null

const headersValidation = Joi.object({
  authorization: Joi.string().required()
}).options({ allowUnknown: true })

module.exports = function(server, mongoose, logger) {
  // Check Email Endpoint
  // NOTE: For more secure applications, this endpoint should either be disabled or authenticated. For more information
  // as to why, refer to the links below:
  // https://postmarkapp.com/guides/password-reset-email-best-practices
  // https://security.stackexchange.com/questions/40694/disclose-to-user-if-account-exists
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Check Email'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note('Generating Check Email endpoint for ' + collectionName)

    const checkEmailHandler = function(request, reply) {
      User.findOne({ email: request.payload.email })
        .then(function(result) {
          if (result) {
            Log.log('Email already exists.')
            return reply(true)
          } else {
            Log.log("Email doesn't exist.")
            return reply(false)
          }
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'POST',
      path: '/user/check-email',
      config: {
        handler: checkEmailHandler,
        auth: null,
        description: 'User check email.',
        tags: ['api', 'User', 'Check Email'],
        validate: {
          payload: {
            email: Joi.string().required()
          }
        },
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

  // Check Password Strength Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Check Password Strength'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note(
      'Generating Check Password Strength endpoint for ' + collectionName
    )

    const checkPasswordHandler = function(request, reply) {
      const results = zxcvbn(request.payload.password)

      return reply({
        score: results.score,
        suggestions: results.feedback.suggestions
      })
    }

    server.route({
      method: 'POST',
      path: '/user/check-password',
      config: {
        handler: checkPasswordHandler,
        auth: null,
        description: 'Check Password Strength.',
        tags: ['api', 'User', 'Check Password Strength'],
        validate: {
          payload: {
            password: Joi.string().allow('')
          }
        },
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

  // Update Current User Password Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Update Current User Password'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note(
      'Generating Update Current User Password endpoint for ' + collectionName
    )

    const updateCurrentUserPasswordPre = [
      {
        assign: 'passwordCheck',
        method: function(request, reply) {
          const results = zxcvbn(request.payload.password)

          let requiredPasswordStrength = 4

          switch (request.auth.credentials.user.roleName) {
            case USER_ROLES.USER:
              requiredPasswordStrength = REQUIRED_PASSWORD_STRENGTH.USER
              break
            case USER_ROLES.ADMIN:
              requiredPasswordStrength = REQUIRED_PASSWORD_STRENGTH.ADMIN
              break
            case USER_ROLES.SUPER_ADMIN:
              requiredPasswordStrength = REQUIRED_PASSWORD_STRENGTH.SUPER_ADMIN
              break
          }

          if (results.score >= requiredPasswordStrength) {
            return reply()
          } else {
            return reply(Boom.badRequest('Stronger password required.'))
          }
        }
      },
      {
        assign: 'password',
        method: function(request, reply) {
          return User.generateHash(request.payload.password, Log).then(function(
            hashedPassword
          ) {
            return reply(hashedPassword)
          })
        }
      }
    ]

    const updateCurrentUserPasswordHandler = function(request, reply) {
      const _id = request.auth.credentials.user._id

      return RestHapi.update(
        User,
        _id,
        { password: request.pre.password.hash, passwordUpdateRequired: false },
        Log
      )
        .then(function(user) {
          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'PUT',
      path: '/user/my/password',
      config: {
        handler: updateCurrentUserPasswordHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Update current user password.',
        tags: ['api', 'User', 'Update Current User Password'],
        validate: {
          headers: headersValidation,
          payload: {
            password: Joi.string().required()
          }
        },
        pre: updateCurrentUserPasswordPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [auditLog(mongoose, { payloadFilter: [] }, Log), demoUser]
        }
      }
    })
  })()

  // Update Current User PIN Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Update Current User PIN'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note(
      'Generating Update Current User PIN endpoint for ' + collectionName
    )

    const updateCurrentUserPINPre = [
      {
        assign: 'pin',
        method: function(request, reply) {
          return User.generateHash(request.payload.pin, Log).then(function(
            hashedPassword
          ) {
            return reply(hashedPassword)
          })
        }
      }
    ]

    const updateCurrentUserPINHandler = function(request, reply) {
      const _id = request.auth.credentials.user._id

      return RestHapi.update(
        User,
        _id,
        { pin: request.pre.pin.hash, pinUpdateRequired: false },
        Log
      )
        .then(function(user) {
          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'PUT',
      path: '/user/my/pin',
      config: {
        handler: updateCurrentUserPINHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Update current user PIN.',
        tags: ['api', 'User', 'Update Current User PIN'],
        validate: {
          headers: headersValidation,
          payload: {
            pin: Joi.string().required()
          }
        },
        pre: updateCurrentUserPINPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [auditLog(mongoose, { payloadFilter: [] }, Log), demoUser]
        }
      }
    })
  })()

  // Update Current User Profile Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Update Current User Profile'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note(
      'Generating Update Current User Profile endpoint for ' + collectionName
    )

    const updateCurrentUserProfilePre = [
      {
        assign: 'emailCheck',
        method: function(request, reply) {
          if (
            !request.payload.profile.email ||
            request.payload.profile.email ===
              request.auth.credentials.user.email
          ) {
            return reply(true)
          }

          const conditions = {
            email: request.payload.profile.email,
            isDeleted: false
          }

          User.findOne(conditions)
            .then(function(user) {
              if (user) {
                return reply(Boom.conflict('Email already in use.'))
              }

              return reply(true)
            })
            .catch(function(error) {
              Log.error(error)
              return reply(RestHapi.errorHelper.formatResponse(error))
            })
        }
      }
    ]

    const updateCurrentUserProfileHandler = function(request, reply) {
      const _id = request.auth.credentials.user._id

      return RestHapi.update(User, _id, request.payload.profile, Log)
        .then(function(user) {
          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(error)
        })
    }

    server.route({
      method: 'PUT',
      path: '/user/my/profile',
      config: {
        handler: updateCurrentUserProfileHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Update current user profile.',
        tags: ['api', 'User', 'Update Current User Profile'],
        validate: {
          headers: headersValidation,
          payload: {
            profile: {
              firstName: Joi.string(),
              lastName: Joi.string(),
              email: Joi.string(),
              title: Joi.string(),
              location: Joi.string(),
              education: Joi.string(),
              bio: Joi.string(),
              profileImageUrl: Joi.string()
            }
          }
        },
        pre: updateCurrentUserProfilePre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [auditLog(mongoose, {}, Log), demoUser]
        }
      }
    })
  })()

  // Delete Current User Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Delete Current User'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note('Generating Delete Current User endpoint for ' + collectionName)

    const deleteCurrentUserHandler = function(request, reply) {
      const _id = request.auth.credentials.user._id

      return RestHapi.deleteOne(User, _id, {}, Log)
        .then(function(user) {
          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'DELETE',
      path: '/user/my',
      config: {
        handler: deleteCurrentUserHandler,
        auth: {
          strategy: authStrategy,
          scope: _.values(USER_ROLES)
        },
        description: 'Delete current user.',
        tags: ['api', 'User', 'Delete Current User'],
        validate: {
          headers: headersValidation
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [auditLog(mongoose, {}, Log), demoUser]
        }
      }
    })
  })()

  // Enable Account Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Enable Account'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note('Generating Enable Account endpoint for ' + collectionName)

    const enableAccountHandler = function(request, reply) {
      const _id = request.params._id

      return RestHapi.update(User, _id, { isEnabled: true }, Log)
        .then(function(user) {
          if (!user) {
            return reply(Boom.notFound('Document not found. That is strange.'))
          }

          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'PUT',
      path: '/user/{_id}/enable',
      config: {
        handler: enableAccountHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'enableUser', '!-enableUser']
        },
        description: 'Enable user account.',
        tags: ['api', 'User', 'Enable Account'],
        validate: {
          headers: headersValidation,
          params: {
            _id: RestHapi.joiHelper.joiObjectId()
          }
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [
            auditLog(mongoose, {}, Log),
            rankAuth(mongoose, '_id'),
            demoAuth
          ]
        }
      }
    })
  })()

  // Disable Account Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Disable Account'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note('Generating Disable Account endpoint for ' + collectionName)

    const disableAccountHandler = function(request, reply) {
      const _id = request.params._id

      return RestHapi.update(User, _id, { isEnabled: false }, Log)
        .then(function(user) {
          if (!user) {
            return reply(Boom.notFound('Document not found. That is strange.'))
          }

          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'PUT',
      path: '/user/{_id}/disable',
      config: {
        handler: disableAccountHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'disableUser', '!-disableUser']
        },
        description: 'Disable user account.',
        tags: ['api', 'User', 'Disable Account'],
        validate: {
          headers: headersValidation,
          params: {
            _id: RestHapi.joiHelper.joiObjectId()
          }
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [
            auditLog(mongoose, {}, Log),
            rankAuth(mongoose, '_id'),
            demoAuth
          ]
        }
      }
    })
  })()

  // Activate Account Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Activate Account'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note('Generating Activate Account endpoint for ' + collectionName)

    const activateAccountHandler = function(request, reply) {
      const _id = request.params._id

      return RestHapi.update(User, _id, { isActive: true }, Log)
        .then(function(user) {
          if (!user) {
            return reply(Boom.notFound('Document not found. That is strange.'))
          }

          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'PUT',
      path: '/user/{_id}/activate',
      config: {
        handler: activateAccountHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'activateUser', '!-activateUser']
        },
        description: 'Activate user account.',
        tags: ['api', 'User', 'Activate Account'],
        validate: {
          headers: headersValidation,
          params: {
            _id: RestHapi.joiHelper.joiObjectId()
          }
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [
            auditLog(mongoose, {}, Log),
            rankAuth(mongoose, '_id'),
            demoAuth
          ]
        }
      }
    })
  })()

  // Deactivate Account Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Deactivate Account'))
    const User = mongoose.model('user')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note('Generating Deactivate Account endpoint for ' + collectionName)

    const deactivateAccountHandler = function(request, reply) {
      const _id = request.params._id

      return RestHapi.update(User, _id, { isActive: false }, Log)
        .then(function(user) {
          if (!user) {
            return reply(Boom.notFound('Document not found. That is strange.'))
          }

          return reply(user)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'PUT',
      path: '/user/{_id}/deactivate',
      config: {
        handler: deactivateAccountHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'deactivateUser', '!-deactivateUser']
        },
        description: 'Deactivate user account.',
        tags: ['api', 'User', 'Deactivate Account'],
        validate: {
          headers: headersValidation,
          params: {
            _id: RestHapi.joiHelper.joiObjectId()
          }
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: [
            auditLog(mongoose, {}, Log),
            rankAuth(mongoose, '_id'),
            demoAuth
          ]
        }
      }
    })
  })()

  // Get User Scope Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Get User Scope'))
    const User = mongoose.model('user')
    const Permission = mongoose.model('permission')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note('Generating Get User Scope endpoint for ' + collectionName)

    const getUserScopeHandler = function(request, reply) {
      return Permission.getScope({ _id: request.params._id }, Log)
        .then(function(permissions) {
          return reply(permissions)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'GET',
      path: '/user/{_id}/scope',
      config: {
        handler: getUserScopeHandler,
        auth: {
          strategy: authStrategy,
          scope: ['root', 'readUserScope', '!-readUserScope']
        },
        description: 'Get user effective permissions.',
        tags: ['api', 'User', 'Get User Scope'],
        validate: {
          params: {
            _id: RestHapi.joiHelper.joiObjectId()
          }
        },
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

  // Get User Connection Stats Endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Get User Connection Stats'))
    const User = mongoose.model('user')
    const Connection = mongoose.model('connection')

    const collectionName = User.collectionDisplayName || User.modelName

    Log.note(
      'Generating Get User Connection Stats endpoint for ' + collectionName
    )

    const getUserConnectionStatsHandler = function(request, reply) {
      const promises = []

      promises.push(
        RestHapi.getAll(
          User,
          request.params._id,
          Connection,
          'connections',
          { isFollowed: true, $count: true },
          Log
        )
      )
      promises.push(
        RestHapi.getAll(
          User,
          request.params._id,
          Connection,
          'connections',
          { isFollowing: true, $count: true },
          Log
        )
      )
      promises.push(
        RestHapi.getAll(
          User,
          request.params._id,
          Connection,
          'connections',
          { isContact: true, $count: true },
          Log
        )
      )

      return Q.all(promises)
        .then(function(result) {
          const connectionStats = {
            followers: result[0],
            following: result[1],
            contacts: result[2]
          }

          return reply(connectionStats)
        })
        .catch(function(error) {
          Log.error(error)
          return reply(RestHapi.errorHelper.formatResponse(error))
        })
    }

    server.route({
      method: 'GET',
      path: '/user/{_id}/connection-stats',
      config: {
        handler: getUserConnectionStatsHandler,
        auth: {
          strategy: authStrategy,
          scope: ['!-readUserConnectionStats']
        },
        description: 'Get user connection stats.',
        tags: ['api', 'User', 'Get User Connection Stats'],
        validate: {
          params: {
            _id: RestHapi.joiHelper.joiObjectId()
          }
        },
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
