'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Chalk = require('chalk');
const Jwt = require('jsonwebtoken');
const RestHapi = require('rest-hapi');
const Bcrypt = require('bcryptjs');
const _ = require('lodash');
const GeneratePassword = require('password-generator');

const Config = require('../../config');
const auditLog = require('../policies/audit-log')

const USER_ROLES = Config.get('/constants/USER_ROLES');
const authStrategy = Config.get('/restHapiConfig/authStrategy');
const expirationPeriod = Config.get('/expirationPeriod');

module.exports = function (server, mongoose, logger) {

  // Registration endpoint
  (function() {
    const Log = logger.bind(Chalk.magenta("Register"));
    const User = mongoose.model('user');
    const Session = mongoose.model('session');
    const Role = mongoose.model('role');

    Log.note("Generating Registration endpoint");

    const registerPre = [{
      assign: 'emailCheck',
      method: function (request, reply) {

        const conditions = {
          email: request.payload.user.email,
          isDeleted: false
        };

        User.findOne(conditions)
          .then(function (user) {

            if (user) {
              return reply(Boom.conflict('Email already in use.'));
            }

            return reply(true);
          })
          .catch(function (error) {
            Log.error(error);
            return reply(Boom.badImplementation('There was an error accessing the database.'));
          });
      }
    }, {
        assign: 'role',
        method: function (request, reply) {

          const conditions = {
              name: request.payload.user.role
          };

          Role.findOne(conditions)
            .then(function (role) {

                if (!role) {
                    return reply(Boom.badRequest('Role doesn\'t exist.'));
                }

                return reply(role);
            })
            .catch(function (error) {
                Log.error(error);
                return reply(Boom.badImplementation('There was an error accessing the database.'));
            });
        }
    }];

    const registerHandler = function (request, reply) {

      const mailer = request.server.plugins.mailer;

      let keyHash = {};
      let user = {};
      let originalPassword = "";

      Session.generateKeyHash(Log)
        .then(function (result) {
          keyHash = result;

          user = request.payload.user;

          if (user.password) {
            originalPassword = user.password;
          }
          else {
            originalPassword = user.password = GeneratePassword(10, false);
          }

          user.role = request.pre.role._id;
          user.roleName = request.pre.role.name;

          user.isActive = false;
          user.activateAccountHash =  keyHash.hash;


          // EXPL: Invited users are forced to update their PIN and password when they first login
          if (request.payload.registerType === "Invite") {
            user.passwordUpdateRequired = true
            user.pinUpdateRequired = true
          }

          return RestHapi.create(User, user, Log);
        })
        .then(function (result) {
          user = result;

          if (request.payload.registerType === "Register") {
            const emailOptions = {
              subject: 'Activate your ' + Config.get('/websiteName') + ' account',
              to: {
                name: request.payload.firstName + " " + request.payload.lastName,
                address: user.email
              }
            };
            const template = 'welcome';

            const token = Jwt.sign({
              email: user.email,
              key: keyHash.key
            }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: '24h' });

            const context = {
              clientURL: Config.get('/clientURL'),
              websiteName: Config.get('/websiteName'),
              key: token
            };

            mailer.sendEmail(emailOptions, template, context, Log)
              .catch(function (error) {
                Log.error('sending welcome email failed:', error);
                return reply(Boom.badImplementation('Sending registration email failed.'));
              });
          }
          else if (request.payload.registerType === "Invite") {
            const emailOptions = {
              subject: 'Invitation to ' + Config.get('/websiteName'),
              to: {
                name: request.payload.firstName + " " + request.payload.lastName,
                address: user.email
              }
            };
            const template = 'invite';

            const token = Jwt.sign({
              email: user.email,
              key: keyHash.key
            }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: '24h' });

            const invitee = request.auth.credentials ? request.auth.credentials.user : {
              firstName: "appy",
              lastName: "Admin"
            };

            const context = {
              clientURL: Config.get('/clientURL'),
              websiteName: Config.get('/websiteName'),
              inviteeName: invitee.firstName + ' ' + invitee.lastName,
              email: request.payload.user.email,
              password: originalPassword,
              key: token
            };

            mailer.sendEmail(emailOptions, template, context, Log)
              .catch(function (error) {
                Log.error('sending invite email failed:', error);
                return reply(Boom.gatewayTimeout('Sending registration email failed.'));
              });
          }

          return reply(user);
        })
        .catch(function (error) {
          Log.error(error);
          return reply(RestHapi.errorHelper.formatResponse(error));
        })
    };

    var headersValidation = Joi.object({
      'authorization': Joi.string()
    }).options({allowUnknown: true}); 

    const optionalAuth = authStrategy === false ? false : { mode: 'try', strategy: authStrategy };

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
            user: Joi.object().keys({
              firstName: Joi.string().required(),
              lastName: Joi.string().required(),
              email: Joi.string().email().required(),
              role: Joi.any().valid(_.values(USER_ROLES)).required(),
              password: Joi.string(),
              pin: Joi.string()
            }).required(),
            registerType: Joi.any().valid(['Register', 'Invite']).required()
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
          'policies': [auditLog(mongoose, {
            payloadFilter: ['user.firstName', 'user.lastName', 'user.email', 'user.role', 'registerType']
          }, Log)]
        }
      }
    });
  }());


  // Send Activation Email endpoint
  (function() {
    const Log = logger.bind(Chalk.magenta("Send Activation Email"));
    const User = mongoose.model('user');
    const Session = mongoose.model('session');

    Log.note("Generating Send Activation Email endpoint");

    const sendActivationEmailPre = [
      {
        assign: 'user',
        method: function (request, reply) {

          const email = request.payload.email;

          User.findOne({ email: email })
            .then(function (user) {
              if (!user) {
                return reply(Boom.notFound('User not found.'));
              }
              return reply(user);
            })
            .catch(function (error) {
              Log.error(error);
              return reply(Boom.badImplementation('There was an error accessing the database.'));
            });
        }
      },
    ];

    const sendActivationEmailHandler = function (request, reply) {

      const mailer = request.server.plugins.mailer;

      let keyHash = {};
      let user = {};

      Session.generateKeyHash(Log)
        .then(function (result) {
          keyHash = result;

          const update = {
            activateAccountHash: keyHash.hash
          };

          return RestHapi.update(User, request.pre.user._id, update);
        })
        .then(function (result) {
          user = result;

          const firstName = user.firstName ? user.firstName : null;
          const lastName = user.lastName ? user.lastName : null;

          const emailOptions = {
            subject: 'Activate your ' + Config.get('/websiteName') + ' account',
            to: {
              name: firstName + " " + lastName,
              address: request.payload.email
            }
          };
          const template = 'welcome';

          const token = Jwt.sign({
            email: request.payload.email,
            key: keyHash.key
          }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: expirationPeriod.medium });


          const context = {
            clientURL: Config.get('/clientURL'),
            key: token
          };

          mailer.sendEmail(emailOptions, template, context, Log)
            .catch(function (error) {
              Log.error('sending activation email failed:', error);
            });

          return reply("Activation email sent.");
        })
        .catch(function (error) {
          if (error.isBoom) {
            return reply(error);
          }
          Log.error(error);
          return reply(Boom.gatewayTimeout('An error occurred.'));
        })
    };

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
            email: Joi.string().email().required()
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
          'policies': [auditLog(mongoose, {}, Log)]
        }
      }
    });
  }());


  // Account Activation endpoint
  (function() {
    const Log = logger.bind(Chalk.magenta("Activate Account"));
    const User = mongoose.model('user');

    Log.note("Generating Account Activation endpoint");

    const accountActivationPre = [
      {
        assign: 'decoded',
        method: function (request, reply) {
          Jwt.verify(request.payload.token, Config.get('/jwtSecret'), function (err, decoded) {
            if (err) {
              Log.error(err)
              return reply(Boom.badRequest('Invalid token.'));
            }

            return reply(decoded);
          });
        }
      },
      {
        assign: 'user',
        method: function (request, reply) {

          const conditions = {
            email: request.pre.decoded.email,
            isDeleted: false
          };

          User.findOne(conditions)
            .then(function (user) {
              if (!user) {
                return reply(Boom.badRequest('Invalid email or key.'));
              }
              return reply(user);
            })
            .catch(function (error) {
              Log.error(error);
              return reply(Boom.badImplementation('There was an error accessing the database.'));
            });
        }
      }
    ];

    const accountActivationHandler = function (request, reply) {

      const key = request.pre.decoded.key;
      const hash = request.pre.user.activateAccountHash;

      Bcrypt.compare(key, hash)
        .then(function (keyMatch) {
          if (!keyMatch) {
            throw Boom.badRequest('Invalid email or key.');
          }

          const _id = request.pre.user._id.toString();
          const update = {
            $set: {
              isActive: true
            },
            $unset: {
              activateAccountHash: undefined
            }
          };

          return RestHapi.update(User, _id, update);
        })
        .then(function (result) {
          return reply({ message: 'Success.' });
        })
        .catch(function (error) {
          if (error.isBoom) {
            return reply(error);
          }
          Log.error(error);
          return reply(Boom.gatewayTimeout('An error occurred.'));
        })
    };

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
          'policies': [auditLog(mongoose, {}, Log)]
        }
      }
    });
  }());

};
