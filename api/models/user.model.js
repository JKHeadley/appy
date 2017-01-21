'use strict';

var Q = require('q');
var Joi = require('joi');
const Async = require('async');
const Bcrypt = require('bcrypt');
var Boom = require('boom');
const chalk = require('chalk');
const Config = require('../../config');
const createToken = require('../utilities/token');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const USER_ROLES = Config.get('/constants/USER_ROLES');
let restHapi = require('rest-hapi');
//TODO: assign a unique text index to email field

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    isActive: {
      type: Types.Boolean,
      default: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    },
    firstName: {
      type: Types.String
    },
    lastName: {
      type: Types.String
    },
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    role: {
      type: Types.String,
      enum: _.values(USER_ROLES),
      required: true
    },
    admin: {
      type: Types.ObjectId,
      ref: "admin"
    },
    resetPassword: {
      token: {
        allowOnUpdate: false,
        exclude: true,
        type: Types.String
      },
      expires: {
        allowOnUpdate: false,
        exclude: true,
        type: Types.Date
      }
    },
    activateAccount: {
      token: {
        allowOnUpdate: false,
        exclude: true,
        type: Types.String
      },
      expires: {
        allowOnUpdate: false,
        exclude: true,
        type: Types.Date
      }
    }
  }, { collection: modelName });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        admin: {
          type: "ONE_ONE",
          model: "admin"
        }
      },
      extraEndpoints: [
        //Login Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Login"));
          const AuthAttempt = mongoose.model('authAttempt');
          const Session = mongoose.model('session');
          const User = mongoose.model('user');
          const Boom = require("boom");
          const createToken = require('../utilities/token');
          const Config = require('../../config');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Login endpoint for " + collectionName);

          var loginPre = [
            {
              assign: 'abuseDetected',
              method: function (request, reply) {

                const ip = request.info.remoteAddress;
                const email = request.payload.email;

                AuthAttempt.abuseDetected(ip, email, (err, detected) => {

                  if (err) {
                    Log.error(err);
                    return reply(err);
                  }

                  if (detected) {
                    return reply(Boom.badRequest('Maximum number of auth attempts reached. Please try again later.'));
                  }

                  reply();
                });
              }
            },
            {
              assign: 'user',
              method: function (request, reply) {

                const email = request.payload.email;
                const password = request.payload.password;

                User.findByCredentials(email, password, Log, (err, user) => {

                  if (err) {
                    Log.error(err);
                    return reply(err);
                  }

                  reply(user);
                });
              }
            },
            {
              assign: 'logAttempt',
              method: function (request, reply) {

                if (request.pre.user) {
                  return reply();
                }

                const ip = request.info.remoteAddress;
                const email = request.payload.email;


                AuthAttempt.createInstance(ip, email, (err, authAttempt) => {

                  if (err) {
                    return reply(err);
                  }

                  return reply(Boom.badRequest('Invalid Email or Password.'));
                });
              }
            },
            {
              assign: 'isActive',
              method: function (request, reply) {

                if (request.pre.user.isActive) {
                  return reply();
                }
                else {
                  return reply(Boom.badRequest('Account is inactive.'));
                }
              }
            },
            {
              assign: 'session',
              method: function (request, reply) {

                Session.createInstance(request.pre.user._id, (err, session) => {

                  if (err) {
                    Log.error(err);
                    return reply(err);
                  }


                  return reply(session);
                });
              }
            }
          ];

          var loginHandler = function (request, reply) {
            const credentials = request.pre.session._id.toString() + ':' + request.pre.session.key;
            const token = createToken(request.pre.user, request.pre.session);

            var authHeader = '';

            if( Config.get('/restHapiConfig/auth') === 'simple') {
              authHeader = 'Basic ' + new Buffer(credentials).toString('base64');
            } else {
              authHeader = 'Bearer ' + token;
            }

            reply({
              user: request.pre.user,
              id_token: token,
              session: request.pre.session,
              authHeader
            });
          };

          server.route({
            method: 'POST',
            path: '/user/login',
            config: {
              handler: loginHandler,
              auth: null,
              description: 'User login.',
              tags: ['api', 'User', 'Login'],
              validate: {
                payload: {
                  email: Joi.string().email().lowercase().required(),
                  password: Joi.string().required()
                }
              },
              pre: loginPre,
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            },
          });
        },

        //Logout Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Logout"));
          const Session = mongoose.model('session');

          var collectionName = model.collectionDisplayName || model.modelName;

          var headersValidation = Joi.object({
            'authorization': Joi.string().required()
          }).options({allowUnknown: true});

          Log.note("Generating Logout endpoint for " + collectionName);

          const logoutHandler = function (request, reply) {

            const credentials = request.auth.credentials || { session: {} };
            const session = credentials.session || {};

            Session.findByIdAndRemove(session._id, (err, sessionDoc) => {

              if (err) {
                return reply(err);
              }

              if (!sessionDoc) {
                return reply(Boom.notFound('Document not found.'));
              }

              reply({ message: 'Success.' });
            });
          };

          server.route({
            method: 'DELETE',
            path: '/user/logout',
            config: {
              handler: logoutHandler,
              auth: Config.get('/restHapiConfig/auth'),
              description: 'User logout.',
              tags: ['api', 'User', 'Logout'],
              validate: {
                headers: headersValidation
              },
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        },

        //Forgot Password Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Forgot Password"));
          const Session = mongoose.model('session');
          const User = mongoose.model('user');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Forgot Password endpoint for " + collectionName);

          const forgotPasswordPre = [{
            assign: 'user',
            method: function (request, reply) {

              const conditions = {
                email: request.payload.email
              };

              User.findOne(conditions, (err, user) => {

                if (err) {
                  return reply(err);
                }

                if (!user) {
                  return reply({ message: 'Success.' }).takeover();
                }

                reply(user);
              });
            }
          }];

          const forgotPasswordHandler = function (request, reply) {

            const mailer = request.server.plugins.mailer;

            Async.auto({
              keyHash: function (done) {
                Session.generateKeyHash(done);
              },
              user: ['keyHash', function (results, done) {

                const _id = request.pre.user._id.toString();
                const update = {
                  $set: {
                    resetPassword: {
                      token: results.keyHash.hash,
                      expires: Date.now() + 10000000
                    }
                  }
                };

                User.findByIdAndUpdate(_id, update, done);
              }],
              email: ['user', function (results, done) {

                const firstName = results.user.firstName ? results.user.firstname : null;
                const lastName = results.user.lastName ? results.user.lastName : null;

                const emailOptions = {
                  subject: 'Reset your ' + Config.get('/websiteName') + ' password',
                  to: {
                    name: firstName + " " + lastName,
                    address: request.payload.email
                  }
                };

                const template = 'forgot-password';

                var token = jwt.sign({
                  email: request.payload.email,
                  key: results.keyHash.key }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" } );//TODO: match expiration with activateAccount expiration

                var context = {
                  clientURL: Config.get('/clientURL'),
                  websiteName: Config.get('/websiteName'),
                  key: token
                };

                mailer.sendEmail(emailOptions, template, context, done);
              }]
            }, (err, results) => {

              if (err) {
                Log.error(err);
                return reply(err);
              }

              reply({ message: 'Success.' });
            });
          };

          server.route({
            method: 'POST',
            path: '/user/password/forgot',
            config: {
              handler: forgotPasswordHandler,
              auth: null,
              description: 'User forgot password.',
              tags: ['api', 'User', 'Forgot Password'],
              validate: {
                payload: {
                  email: Joi.string().email().required()
                }
              },
              pre: forgotPasswordPre,
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        },

        //Reset Password Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Reset Password"));
          const User = mongoose.model('user');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Reset Password endpoint for " + collectionName);

          const resetPasswordPre = [
            {
              assign: 'decoded',
              method: function (request, reply) {

                jwt.verify(request.payload.token, Config.get('/jwtSecret'), function(err, decoded) {
                  if (err) {
                    return reply(Boom.badRequest('Invalid email or key.'));
                  }

                  reply(decoded);
                });
              }
            },
            {
              assign: 'user',
              method: function (request, reply) {

                const conditions = {
                  email: request.pre.decoded.email,
                  'resetPassword.expires': { $gt: Date.now() }
                };

                User.findOne(conditions, (err, user) => {

                  if (err) {
                    return reply(err);
                  }

                  if (!user) {
                    return reply(Boom.badRequest('Invalid email or key.'));
                  }

                  reply(user);
                });
              }
            }];

          const resetPasswordHandler = function (request, reply) {

            Async.auto({
              keyMatch: function (done) {

                const key = request.pre.decoded.key;
                const token = request.pre.user.resetPassword.token;
                Bcrypt.compare(key, token, done);
              },
              passwordHash: ['keyMatch', function (results, done) {

                if (!results.keyMatch) {
                  return reply(Boom.badRequest('Invalid email or key.'));
                }

                User.generatePasswordHash(request.payload.password, done);
              }],
              user: ['passwordHash', function (results, done) {

                const id = request.pre.user._id.toString();
                const update = {
                  $set: {
                    password: results.passwordHash.hash
                  },
                  $unset: {
                    resetPassword: undefined
                  }
                };

                User.findByIdAndUpdate(id, update, done);
              }]
            }, (err, results) => {

              if (err) {
                return reply(err);
              }

              reply({ message: 'Success.' });
            });
          };

          server.route({
            method: 'POST',
            path: '/user/password/reset',
            config: {
              handler: resetPasswordHandler,
              auth: null,
              description: 'User reset password.',
              tags: ['api', 'User', 'Reset Password'],
              validate: {
                payload: {
                  token: Joi.string().required(),
                  password: Joi.string().required()
                }
              },
              pre: resetPasswordPre,
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        },

        //Check Email Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Check Email"));
          const User = mongoose.model('user');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Check Email endpoint for " + collectionName);

          const checkEmailHandler = function (request, reply) {

            User.find({ email: request.payload.email })
                .then(function(results) {
                  if (results.length > 0) {
                    Log.log("Email already exists.");
                    return reply(true);
                  }
                  else {
                    Log.log("Email doesn't exist.");
                    return reply(false);
                  }
                })
                .catch(function(error) {
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
                  email: Joi.string().email().required()
                }
              },
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        },

        //Registration Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Register"));
          const User = mongoose.model('user');
          const Session = mongoose.model('session');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Registration endpoint for " + collectionName);

          const registerPre = [{
            assign: 'emailCheck',
            method: function (request, reply) {

              const conditions = {
                email: request.payload.email
              };

              User.findOne(conditions, (err, user) => {

                if (err) {
                  return reply(err);
                }

                if (user) {
                  return reply(Boom.conflict('Email already in use.'));
                }

                reply(true);
              });
            }
          }];

          const signUpHandler = function (request, reply) {

            const mailer = request.server.plugins.mailer;

            Async.auto({
              keyHash: function (done) {

                Session.generateKeyHash(done);
              },
              user: ['keyHash', function (results, done) {
                let userPayload = { payload: request.payload.user };
                let userCopy = {};

                let userData = {
                  firstName: userPayload.payload.firstName,
                  lastName: userPayload.payload.lastName,
                  password: userPayload.payload.password,
                  email: userPayload.payload.email,
                  role: request.payload.role,
                  isActive: false,
                  activateAccount: {
                    token: results.keyHash.hash,
                    expires: Date.now() + 10000000 //TODO: set token expiration in config
                  }
                };

                restHapi.create(User, userData, Log)
                    .then(function(user) {
                      done(null, user);
                    })
                    .catch(function(err) {
                      Log.error(err);
                      done(err, null);
                    });

              }],
              welcome: ['user', function (results, done) {
                if (request.payload.registerType === "Register") {
                  const emailOptions = {
                    subject: 'Activate your ' + Config.get('/websiteName') + ' account',
                    to: {
                      name: request.payload.firstName + " " + request.payload.lastName,
                      address: results.user.email
                    }
                  };
                  const template = 'welcome';

                  var token = jwt.sign({
                    email: results.user.email,
                    key: results.keyHash.key }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" } );//TODO: match expiration with activateAccount expiration

                  var context = {
                    clientURL: Config.get('/clientURL'),
                    websiteName: Config.get('/websiteName'),
                    key: token
                  };

                  mailer.sendEmail(emailOptions, template, context, (err) => {

                    if (err) {
                      Log.error('sending welcome email failed:', err.stack);
                    }
                  });
                }

                done();
              }],
              invite: ['user', function (results, done) {
                if (request.payload.registerType === "Invite") {
                  const emailOptions = {
                    subject: 'Invitation to ' + Config.get('/websiteName'),
                    to: {
                      name: request.payload.firstName + " " + request.payload.lastName,
                      address: results.user.email
                    }
                  };
                  const template = 'invite';

                  var token = jwt.sign({
                    email: results.user.email,
                    key: results.keyHash.key }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" } );//TODO: match expiration with activateAccount expiration

                  var invitee = request.auth.credentials ? request.auth.credentials.user : { firstName: "Appy", lastName: "Admin" } ;
                  var context = {
                    clientURL: Config.get('/clientURL'),
                    websiteName: Config.get('/websiteName'),
                    inviteeName: invitee.firstName + ' ' + invitee.lastName,
                    email: request.payload.user.email,
                    password: request.payload.originalPassword,
                    key: token
                  };

                  mailer.sendEmail(emailOptions, template, context, (err) => {

                    if (err) {
                      Log.error('sending invite email failed:', err.stack);
                    }
                  });
                }

                done();
              }],
              session: ['user', function (results, done) {//TODO: probably don't need this session
                Session.createInstance(results.user._id.toString(), done);
              }]
            }, (err, results) => {

              if (err) {
                Log.error(err);
                return reply(Boom.badRequest(err.message));
              }

              const user = results.user;
              const credentials = results.session._id + ':' + results.session.key;
              const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');

              reply({
                user: user,
                session: results.session,
                id_token: createToken(user, results.session),
                authHeader
              });
            });
          };

          let auth = {};
          if (Config.get('/restHapiConfig/auth') === false) {
            auth = false;
          }
          else {
            auth = { mode: 'optional', strategy: Config.get('/restHapiConfig/auth') };
          }

          server.route({
            method: 'POST',
            path: '/user/register',
            config: {
              handler: signUpHandler,
              auth: auth,
              description: 'User registration.',
              tags: ['api', 'User', 'Registration'],
              validate: {
                payload: {
                  user: Joi.object().keys({
                    firstName: Joi.string(),
                    lastName: Joi.string(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                  }).required(),
                  role: Joi.string().required(),
                  registerType: Joi.any().valid(['Register','Invite']).required()
                }
              },
              pre: registerPre,
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        },

        //Send Activation Email Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Send Activation Email"));
          const User = mongoose.model('user');
          const Session = mongoose.model('session');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Send Activation Email endpoint for " + collectionName);

          const sendActivationEmailPre = [
            {
              assign: 'user',
              method: function (request, reply) {

                const email = request.payload.email;

                User.findOne({ email: email }, (err, user) => {

                  if (err) {
                    return reply(err);
                  }

                  reply(user);
                });
              }
            },
          ];

          const sendActivationEmailHandler = function (request, reply) {

            const mailer = request.server.plugins.mailer;

            Async.auto({
              keyHash: function (done) {

                Session.generateKeyHash(done);
              },
              user: ['keyHash', function (results, done) {

                var document = {
                  activateAccount: {
                    token: results.keyHash.hash,
                    expires: Date.now() + 10000000 //TODO: set token expiration in config
                  }
                };

                User.findByIdAndUpdate(request.pre.user._id, document)
                    .then(function(user) {
                      done(null, user);
                    })
                    .catch(function(err) {
                      done(err, null);
                    });

              }],
              welcome: ['user', function (results, done) {

                const firstName = results.user.firstName ? results.user.firstName : null;
                const lastName = results.user.lastName ? results.user.lastName : null;

                const emailOptions = {
                  subject: 'Activate your ' + Config.get('/websiteName') + ' account',
                  to: {
                    name: firstName + " " + lastName,
                    address: request.payload.email
                  }
                };
                const template = 'welcome';

                var token = jwt.sign({
                  email: request.payload.email,
                  key: results.keyHash.key }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" } );//TODO: match expiration with activateAccount expiration


                var context = {
                  clientURL: Config.get('/clientURL'),
                  key: token
                };

                mailer.sendEmail(emailOptions, template, context, (err) => {

                  if (err) {
                    Log.error('Send activation email failed:', err);
                  }
                });

                done();
              }]
            }, (err, results) => {

              if (err) {
                Log.error(err);
                return reply(err);
              }

              reply("Activation email sent.");
            });
          };

          server.route({
            method: 'POST',
            path: '/user/send-activation-email',
            config: {
              handler: sendActivationEmailHandler,
              auth: null,
              description: 'User activation email.',
              tags: ['api', 'User', 'Activation Email'],
              validate: {
                payload: {
                  email: Joi.string().email().required()
                }
              },
              pre: sendActivationEmailPre,
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        },

        //Account Activation Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(chalk.magenta("Activate Account"));
          const User = mongoose.model('user');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Account Activation endpoint for " + collectionName);

          const accountActivationPre = [
            {
              assign: 'decoded',
              method: function (request, reply) {

                jwt.verify(request.query.token, Config.get('/jwtSecret'), function(err, decoded) {
                  if (err) {
                    return reply(Boom.badRequest('Invalid email or key.'));
                  }

                  reply(decoded);
                });
              }
            },
            {
              assign: 'user',
              method: function (request, reply) {

                const conditions = {
                  email: request.pre.decoded.email,
                  'activateAccount.expires': { $gt: Date.now() }
                };

                User.findOne(conditions, (err, user) => {

                  if (err) {
                    return reply(err);
                  }

                  if (!user) {
                    return reply(Boom.badRequest('Invalid email or key.'));
                  }

                  reply(user);
                });
              }
            }
          ];

          const accountActivationHandler = function (request, reply) {

            Async.auto({
              keyMatch: function (done) {

                const key = request.pre.decoded.key;
                const token = request.pre.user.activateAccount.token;
                Bcrypt.compare(key, token, done);
              },
              passwordHash: ['keyMatch', function (results, done) {

                if (!results.keyMatch) {
                  return reply(Boom.badRequest('Invalid email or key.'));
                }

                done();
              }],
              user: ['passwordHash', function (results, done) {

                const id = request.pre.user._id.toString();
                const update = {
                  $set: {
                    isActive: true
                  },
                  $unset: {
                    activateAccount: undefined
                  }
                };

                User.findByIdAndUpdate(id, update, done);
              }]
            }, (err, results) => {

              if (err) {
                return reply(err);
              }

              reply({ message: 'Success.' });
            });
          };

          server.route({
            method: 'GET',
            path: '/user/activate',
            config: {
              handler: accountActivationHandler,
              auth: null,
              description: 'User account activation.',
              tags: ['api', 'User', 'Activate Account'],
              validate: {
                query: {
                  token: Joi.string().required()
                }
              },
              pre: accountActivationPre,
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        },

      ],
      create: {
        pre: function (payload, Log) {
          var deferred = Q.defer();

          mongoose.model('user').generatePasswordHash(payload.password, function(err, hashedPassword) {

            if (err) {
              deferred.reject(err);
            }
            else {
              payload.password = hashedPassword.hash;
              deferred.resolve(payload);
            }

          });

          return deferred.promise;
        }
      }
    },

    createInstance: function(user) {
      var deferred = Q.defer();

      mongoose.model('user').generatePasswordHash(user.password, function(err, hashedPassword) {

        if (err) {
          deferred.reject(err);
        }
        else {
          user.password = hashedPassword.hash;
          deferred.resolve(mongoose.model('user').create(user));
        }

      });

      return deferred.promise;
    },

    generatePasswordHash: function(password, callback) {

      Async.auto({
        salt: function (done) {

          Bcrypt.genSalt(10, done);
        },
        hash: ['salt', function (results, done) {

          Bcrypt.hash(password, results.salt, done);
        }]
      }, (err, results) => {

        if (err) {
          return callback(err);
        }

        callback(null, {
          password,
          hash: results.hash
        });
      });
    },

    findByCredentials: function(email, password, Log, callback) {

      const self = this;

      Async.auto({
        user: function (done) {

          const query = {
            email: email
          };

          var mongooseQuery = self.findOne(query);
          //EXPL: populate any existing role profile
          mongooseQuery.populate([
            {path: 'admin'},
            {path: 'buildingManager', populate: {path: 'company', populate: {path: 'primaryContact'}}},
            {path: 'tradeExpert', populate: {path: 'company', populate: {path: 'primaryContact'}}},
            {path: 'firstResponder', populate: {path: 'company', populate: {path: 'primaryContact'}}}
          ]);
          mongooseQuery.exec()
              .then(function(user) {
                done(null, user);
              })
              .catch(function(err) {
                done(err, null);
              });
        },
        passwordMatch: ['user', function (results, done) {

          if (!results.user) {
            return done(null, false);
          }

          const source = results.user.password;

          Bcrypt.compare(password, source, done);
        }]
      }, (err, results) => {

        if (err) {
          return callback(err);
        }

        if (results.passwordMatch) {
          return callback(null, results.user);
        }

        callback();
      });
    },

    findByEmail: function(email, callback) {

      const query = { email: email.toLowerCase() };

      this.findOne(query, callback);
    }
  };

  return Schema;
};
