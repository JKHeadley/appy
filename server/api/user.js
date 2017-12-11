'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Chalk = require('chalk');
const _ = require('lodash');
const zxcvbn = require('zxcvbn');
const RestHapi = require('rest-hapi');

const Config = require('../../config');

const USER_ROLES = Config.get('/constants/USER_ROLES');
const REQUIRED_PASSWORD_STRENGTH = Config.get('/constants/REQUIRED_PASSWORD_STRENGTH');
const authStrategy = Config.get('/restHapiConfig/authStrategy');

const headersValidation = Joi.object({
    'authorization': Joi.string().required()
}).options({ allowUnknown: true });

module.exports = function (server, mongoose, logger) {
    // Check Username Endpoint
    (function () {
        const Log = logger.bind(Chalk.magenta("Check Username"));
        const User = mongoose.model('user');

        const collectionName = User.collectionDisplayName || User.modelName;

        Log.note("Generating Check Username endpoint for " + collectionName);

        const checkUsernameHandler = function (request, reply) {

            User.findOne({ username: request.payload.username })
                .then(function (result) {
                    if (result) {
                        Log.log("Username already exists.");
                        return reply(true);
                    }
                    else {
                        Log.log("Username doesn't exist.");
                        return reply(false);
                    }
                })
                .catch(function (error) {
                    Log.error(error);
                    return reply(Boom.badImplementation('There was an error accessing the database.'));
                });
        };

        server.route({
            method: 'POST',
            path: '/user/check-username',
            config: {
                handler: checkUsernameHandler,
                auth: null,
                description: 'User check username.',
                tags: ['api', 'User', 'Check Username'],
                validate: {
                    payload: {
                        username: Joi.string().required()
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
        });
    }());

    
    // Check Email Endpoint
    // NOTE: For more secure applications, this endpoint should either be disabled or authenticated. For more information
    // as to why, refer to the links below:
    // https://postmarkapp.com/guides/password-reset-email-best-practices
    // https://security.stackexchange.com/questions/40694/disclose-to-user-if-account-exists
    (function () {
        const Log = logger.bind(Chalk.magenta("Check Email"));
        const User = mongoose.model('user');

        const collectionName = User.collectionDisplayName || User.modelName;

        Log.note("Generating Check Email endpoint for " + collectionName);

        const checkEmailHandler = function (request, reply) {

            User.findOne({ email: request.payload.email })
                .then(function (result) {
                    if (result) {
                        Log.log("Email already exists.");
                        return reply(true);
                    }
                    else {
                        Log.log("Email doesn't exist.");
                        return reply(false);
                    }
                })
                .catch(function (error) {
                    Log.error(error);
                    return reply(Boom.badImplementation('There was an error accessing the database.'));
                });
        };

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
        });
    }());


    // Update User Password Endpoint
    (function () {
        const Log = logger.bind(Chalk.magenta("Update User Password"));
        const User = mongoose.model('user');

        const collectionName = User.collectionDisplayName || User.modelName;

        Log.note("Generating Update User Password endpoint for " + collectionName);

        const updateUserPasswordPre = [{
            assign: 'passwordCheck',
            method: function (request, reply) {

                if (request.auth.credentials.user.roleName === USER_ROLES.SUPER_ADMIN) {
                  return reply(true);
                }

                const results = zxcvbn(request.payload.password);

                if (results.score >= REQUIRED_PASSWORD_STRENGTH) {
                  return reply();
                }
                else {
                  return reply(Boom.badRequest('Stronger password required.'));
                }
            }
        }, {
            assign: 'password',
            method: function (request, reply) {
                return User.generateHash(request.payload.password, Log)
                    .then(function (hashedPassword) {
                        return reply(hashedPassword);
                    });
            }
        }];

        const updateUserPasswordHandler = function (request, reply) {

            const _id = request.params._id;

            return RestHapi.update(User, _id, { password: request.pre.password.hash }, Log)
                .then(function (user) {

                    if (!user) {
                        return reply(Boom.notFound('Document not found. That is strange.'));
                    }

                    return reply(user);
                })
              .catch(function (error) {
                Log.error(error);
                return reply(Boom.badImplementation('There was an error handling the request.'));
              })
        };

        server.route({
            method: 'PUT',
            path: '/user/{_id}/password',
            config: {
                handler: updateUserPasswordHandler,
                auth: {
                    strategy: authStrategy,
                    scope: ['root', 'updateUserPassword']
                },
                description: 'Update user password.',
                tags: ['api', 'User', 'Update User Password'],
                validate: {
                    headers: headersValidation,
                    params: {
                        _id: Joi.string()
                    },
                    payload: {
                        password: Joi.string().required()
                    }
                },
                pre: updateUserPasswordPre,
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
        });
    }());


    // Check Password Strength Endpoint
    (function () {
    const Log = logger.bind(Chalk.magenta("Check Password Strength"));
    const User = mongoose.model('user');

    const collectionName = User.collectionDisplayName || User.modelName;

    Log.note("Generating Check Password Strength endpoint for " + collectionName);

    const checkPasswordHandler = function (request, reply) {
      const results = zxcvbn(request.payload.password);

      return reply({ score: results.score, suggestions: results.feedback.suggestions });
    };

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
    });
  }());

    
    // Update Current User Password Endpoint
    (function () {
        const Log = logger.bind(Chalk.magenta("Update Current User Password"));
        const User = mongoose.model('user');

        const collectionName = User.collectionDisplayName || User.modelName;

        Log.note("Generating Update Current User Password endpoint for " + collectionName);

        const updateCurrentUserPasswordPre = [{
            assign: 'passwordCheck',
            method: function (request, reply) {

                Owasp.config(Config.get('/passwordRequirements'));

                var result = Owasp.test(request.payload.password);

                if (result.strong) {
                    return reply(true);
                }
                else {
                    Log.error(result.errors);
                    return reply(Boom.badRequest(result.errors));
                }
            }
        }, {
            assign: 'password',
            method: function (request, reply) {
                return User.generateHash(request.payload.password, Log)
                    .then(function (hashedPassword) {
                        return reply(hashedPassword);
                    });
            }
        }];

        const updateCurrentUserHandler = function (request, reply) {

            const _id = request.auth.credentials.user._id;

            return RestHapi.update(User, _id, { password: request.pre.password.hash }, Log)
                .then(function (user) {
                    return reply(user);
                })
                .catch(function (error) {
                    Log.error(error);
                    return reply(error);
                });
        };

        server.route({
            method: 'PUT',
            path: '/user/my/password',
            config: {
                handler: updateCurrentUserHandler,
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
                    }
                }
            }
        });
    }());


    // Enable Account Endpoint
    (function () {
        const Log = logger.bind(Chalk.magenta("Enable Account"));
        const User = mongoose.model('user');

        const collectionName = User.collectionDisplayName || User.modelName;

        Log.note("Generating Enable Account endpoint for " + collectionName);

        const enableAccountHandler = function (request, reply) {

            const _id = request.params._id;

            return RestHapi.update(User, _id, { isEnabled: true }, Log)
                .then(function (user) {

                    if (!user) {
                        return reply(Boom.notFound('Document not found. That is strange.'));
                    }

                    return reply(user);
                })
                .catch(function (error) {
                    Log.error(error);
                    return reply(error);
                });
        };

        server.route({
            method: 'PUT',
            path: '/user/enable/{_id}',
            config: {
                handler: enableAccountHandler,
                auth: {
                    strategy: authStrategy,
                    scope: ['SuperAdmin']
                },
                description: 'Enable user account.',
                tags: ['api', 'User', 'Enable Account'],
                validate: {
                    headers: headersValidation,
                    params: {
                        _id: Joi.string().required()
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
        });
    }());


    // Disable Account Endpoint
    (function () {
        const Log = logger.bind(Chalk.magenta("Disable Account"));
        const User = mongoose.model('user');

        const collectionName = User.collectionDisplayName || User.modelName;

        Log.note("Generating Disable Account endpoint for " + collectionName);

        const disableAccountHandler = function (request, reply) {

            const _id = request.params._id;

            return RestHapi.update(User, _id, { isEnabled: false }, Log)
                .then(function (user) {

                    if (!user) {
                        return reply(Boom.notFound('Document not found. That is strange.'));
                    }

                    return reply(user);
                })
                .catch(function (error) {
                    Log.error(error);
                    return reply(error);
                });
        };

        server.route({
            method: 'PUT',
            path: '/user/disable/{_id}',
            config: {
                handler: disableAccountHandler,
                auth: {
                    strategy: authStrategy,
                    scope: ['SuperAdmin']
                },
                description: 'Disable user account.',
                tags: ['api', 'User', 'Disable Account'],
                validate: {
                    headers: headersValidation,
                    params: {
                        _id: Joi.string().required()
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
        });
    }());


    // Activate Account Endpoint
    (function () {
      const Log = logger.bind(Chalk.magenta("Activate Account"));
      const User = mongoose.model('user');

      const collectionName = User.collectionDisplayName || User.modelName;

      Log.note("Generating Activate Account endpoint for " + collectionName);

      const activateAccountHandler = function (request, reply) {

        const _id = request.params._id;

        return RestHapi.update(User, _id, { isActive: true }, Log)
          .then(function (user) {

            if (!user) {
              return reply(Boom.notFound('Document not found. That is strange.'));
            }

            return reply(user);
          })
          .catch(function (error) {
            Log.error(error);
            return reply(error);
          });
      };

      server.route({
        method: 'PUT',
        path: '/user/activate/{_id}',
        config: {
          handler: activateAccountHandler,
          auth: {
            strategy: authStrategy,
            scope: ['SuperAdmin']
          },
          description: 'Activate user account.',
          tags: ['api', 'User', 'Activate Account'],
          validate: {
            headers: headersValidation,
            params: {
              _id: Joi.string().required()
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
      });
    }());


    // Deactivate Account Endpoint
    (function () {
      const Log = logger.bind(Chalk.magenta("Deactivate Account"));
      const User = mongoose.model('user');

      const collectionName = User.collectionDisplayName || User.modelName;

      Log.note("Generating Deactivate Account endpoint for " + collectionName);

      const deactivateAccountHandler = function (request, reply) {

        const _id = request.params._id;

        return RestHapi.update(User, _id, { isActive: false }, Log)
          .then(function (user) {

            if (!user) {
              return reply(Boom.notFound('Document not found. That is strange.'));
            }

            return reply(user);
          })
          .catch(function (error) {
            Log.error(error);
            return reply(error);
          });
      };

      server.route({
        method: 'PUT',
        path: '/user/deactivate/{_id}',
        config: {
          handler: deactivateAccountHandler,
          auth: {
            strategy: authStrategy,
            scope: ['SuperAdmin']
          },
          description: 'Deactivate user account.',
          tags: ['api', 'User', 'Deactivate Account'],
          validate: {
            headers: headersValidation,
            params: {
              _id: Joi.string().required()
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
      });
    }());


    // Get User Scope Endpoint
    (function () {
    const Log = logger.bind(Chalk.magenta("Get User Scope"));
    const User = mongoose.model('user');
    const Permission = mongoose.model('permission');

    const collectionName = User.collectionDisplayName || User.modelName;

    Log.note("Generating Get User Scope endpoint for " + collectionName);

    const getUserScopeHandler = function (request, reply) {

      return Permission.getScope({ _id: request.params._id}, Log)
        .then(function (permissions) {
          return reply(permissions);
        })
        .catch(function (error) {
          Log.error(error);
          return reply(error);
        });
    };

    server.route({
      method: 'GET',
      path: '/user/{_id}/scope',
      config: {
        handler: getUserScopeHandler,
        auth: {
          strategy: authStrategy,
          scope: [USER_ROLES.SUPER_ADMIN]
        },
        description: 'Get user effective permissions.',
        tags: ['api', 'User', 'Get User Scope'],
        validate: {
          params: {
            _id: Joi.string()
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
    });
  }());
};
