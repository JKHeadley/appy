'use strict'

const Joi = require('joi')
const Boom = require('boom')
const Chalk = require('chalk')
const Jwt = require('jsonwebtoken')
const RestHapi = require('rest-hapi')
const Bcrypt = require('bcryptjs')
const _ = require('lodash')
const GeneratePassword = require('password-generator')
const errorHelper = require('../utilities/errorHelper')

const Config = require('../../config/config')
const auditLog = require('../policies/audit-log')

const USER_ROLES = Config.get('/constants/USER_ROLES')
const WEB_TITLE = Config.get('/constants/WEB_TITLE')
const authStrategy = Config.get('/restHapiConfig/authStrategy')
const EXPIRATION_PERIOD = Config.get('/constants/EXPIRATION_PERIOD')

module.exports = function(server, mongoose, logger) {
  // Registration endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Register'))
    const User = mongoose.model('user')
    const Session = mongoose.model('session')
    const Role = mongoose.model('role')

    Log.note('Generating Registration endpoint')

    const registerPre = [
      {
        assign: 'emailCheck',
        method: async function(request, h) {
          try {
            const conditions = {
              email: request.payload.user.email,
              isDeleted: false
            }

            let user = await User.findOne(conditions)
            if (user) {
              throw Boom.conflict('Email already in use.')
            }

            return true
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      },
      {
        assign: 'role',
        method: async function(request, h) {
          try {
            const conditions = {
              name: request.payload.user.role
            }

            let role = await Role.findOne(conditions)
            if (!role) {
              throw Boom.badRequest("Role doesn't exist.")
            }

            return role
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      }
    ]

    const registerHandler = async function(request, h) {
      try {
        const mailer = request.server.plugins.mailer

        let keyHash = {}
        let user = {}
        let originalPassword = ''

        keyHash = await Session.generateKeyHash(Log)

        user = request.payload.user

        if (user.password) {
          originalPassword = user.password
        } else {
          originalPassword = user.password = GeneratePassword(10, false)
        }

        user.role = request.pre.role._id
        user.roleName = request.pre.role.name

        user.isActive = false
        user.activateAccountHash = keyHash.hash

        // Invited users are forced to update their PIN and password when they first login
        if (request.payload.registerType === 'Invite') {
          user.passwordUpdateRequired = true
          user.pinUpdateRequired = true
        }

        user = await RestHapi.create(User, user, Log)

        if (request.payload.registerType === 'Register') {
          const emailOptions = {
            subject: 'Activate your ' + WEB_TITLE + ' account',
            to: {
              name:
              request.payload.firstName + ' ' + request.payload.lastName,
              address: user.email
            }
          }
          const template = 'welcome'

          const token = Jwt.sign(
            {
              email: user.email,
              key: keyHash.key
            },
            Config.get('/jwtSecret'),
            { algorithm: 'HS256', expiresIn: '24h' }
          )

          const context = {
            clientURL: Config.get('/clientURL'),
            websiteName: WEB_TITLE,
            key: token
          }

          try {
            await mailer.sendEmail(emailOptions, template, context, Log)
          } catch (err) {
            Log.error('sending registration email failed:', err)
            throw err
          }
        } else if (request.payload.registerType === 'Invite') {
          const emailOptions = {
            subject: 'Invitation to ' + WEB_TITLE,
            to: {
              name:
              request.payload.firstName + ' ' + request.payload.lastName,
              address: user.email
            }
          }
          const template = 'invite'

          const token = Jwt.sign(
            {
              email: user.email,
              key: keyHash.key
            },
            Config.get('/jwtSecret'),
            { algorithm: 'HS256', expiresIn: '24h' }
          )

          const invitee = request.auth.credentials
            ? request.auth.credentials.user
            : {
              firstName: 'appy',
              lastName: 'Admin'
            }

          const context = {
            clientURL: Config.get('/clientURL'),
            websiteName: WEB_TITLE,
            inviteeName: invitee.firstName + ' ' + invitee.lastName,
            email: request.payload.user.email,
            password: originalPassword,
            key: token
          }

          try {
            await mailer.sendEmail(emailOptions, template, context, Log)
          } catch (err) {
            Log.error('sending registration email failed:', err)
            throw err
          }
        }

        return user
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    var headersValidation = Joi.object({
      authorization: Joi.string()
    }).options({ allowUnknown: true })

    const optionalAuth =
      authStrategy === false ? false : { mode: 'try', strategy: authStrategy }

    server.route({
      method: 'POST',
      path: '/register',
      config: {
        handler: registerHandler,
        auth: optionalAuth,
        description: 'User registration.',
        tags: ['api', 'Registration'],
        validate: {
          headers: headersValidation,
          payload: {
            user: Joi.object()
              .keys({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string()
                  .email()
                  .required(),
                role: Joi.any()
                  .valid(_.values(USER_ROLES))
                  .required(),
                password: Joi.string(),
                pin: Joi.string()
              })
              .required(),
            registerType: Joi.any()
              .valid(['Register', 'Invite'])
              .required()
          }
        },
        pre: registerPre,
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
            auditLog(
              mongoose,
              {
                payloadFilter: [
                  'user.firstName',
                  'user.lastName',
                  'user.email',
                  'user.role',
                  'registerType'
                ]
              },
              Log
            )
          ]
        }
      }
    })
  })()

  // Send Activation Email endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Send Activation Email'))
    const User = mongoose.model('user')
    const Session = mongoose.model('session')

    Log.note('Generating Send Activation Email endpoint')

    const sendActivationEmailPre = [
      {
        assign: 'user',
        method: async function(request, h) {
          try {
            const email = request.payload.email

            let user = await User.findOne({ email: email })
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

    const sendActivationEmailHandler = async function(request, h) {
      try {
        const mailer = request.server.plugins.mailer

        let keyHash = {}
        let user = {}

        keyHash = await Session.generateKeyHash(Log)

        const update = {
          activateAccountHash: keyHash.hash
        }

        user = await RestHapi.update(User, request.pre.user._id, update)

        const firstName = user.firstName ? user.firstName : null
        const lastName = user.lastName ? user.lastName : null

        const emailOptions = {
          subject: 'Activate your ' + WEB_TITLE + ' account',
          to: {
            name: firstName + ' ' + lastName,
            address: request.payload.email
          }
        }
        const template = 'welcome'

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
          key: token
        }

        try {
          await mailer.sendEmail(emailOptions, template, context, Log)
        } catch (err) {
          Log.error('sending registration email failed:', err)
          throw err
        }

        return { message: 'Activation email sent.' }
      } catch (err) {
        errorHelper.handleError(err, Log)
      }
    }

    server.route({
      method: 'POST',
      path: '/register/send-activation-email',
      config: {
        handler: sendActivationEmailHandler,
        auth: null,
        description: 'User activation email.',
        tags: ['api', 'Activation Email'],
        validate: {
          payload: {
            email: Joi.string()
              .email()
              .required()
          }
        },
        pre: sendActivationEmailPre,
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

  // Account Activation endpoint
  ;(function() {
    const Log = logger.bind(Chalk.magenta('Activate Account'))
    const User = mongoose.model('user')

    Log.note('Generating Account Activation endpoint')

    const accountActivationPre = [
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
                    reject(Boom.unauthorized('Invalid token.'))
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
            const conditions = {
              email: request.pre.decoded.email,
              isDeleted: false
            }

            let user = await User.findOne(conditions)
            if (!user) {
              throw Boom.badRequest('Invalid email or key.')
            }
            return user
          } catch (err) {
            errorHelper.handleError(err, Log)
          }
        }
      }
    ]

    const accountActivationHandler = async function(request, h) {
      try {
        const key = request.pre.decoded.key
        const hash = request.pre.user.activateAccountHash

        let keyMatch = await Bcrypt.compare(key, hash)
        if (!keyMatch) {
          throw Boom.badRequest('Invalid email or key.')
        }

        const _id = request.pre.user._id.toString()
        const update = {
          $set: {
            isActive: true
          },
          $unset: {
            activateAccountHash: undefined
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
      path: '/register/activate',
      config: {
        handler: accountActivationHandler,
        auth: null,
        description: 'User account activation.',
        tags: ['api', 'Activate Account'],
        validate: {
          payload: {
            token: Joi.string().required()
          }
        },
        pre: accountActivationPre,
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
}
