'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcryptjs');
const Chalk = require('Chalk');
const Jwt = require('jsonwebtoken');
const RestHapi = require('rest-hapi');
const _ = require('lodash');

const Config = require('../../config');
const Token = require('../utilities/token');

const USER_ROLES = Config.get('/constants/USER_ROLES');
//TODO: assign a unique text index to email field

module.exports = function (mongoose) {
  const modelName = "user";
  const Types = mongoose.Schema.Types;
  const Schema = new mongoose.Schema({
    isActive: {
      type: Types.Boolean,
      allowOnUpdate: false,
      default: false
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
    collectionName: modelName,
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
          Log = Log.bind(Chalk.magenta("Login"));
          const AuthAttempt = mongoose.model('authAttempt');
          const Session = mongoose.model('session');
          const User = mongoose.model('user');

          const collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Login endpoint for " + collectionName);

          const loginPre = [
            {
              assign: 'abuseDetected',
              method: function (request, reply) {

                const ip = request.info.remoteAddress;
                const email = request.payload.email;

                AuthAttempt.abuseDetected(ip, email, Log)
                  .then(function (detected) {
                    if (detected) {
                      return reply(Boom.badRequest('Maximum number of auth attempts reached. Please try again later.'));
                    }
                    return reply();
                  })
                  .catch(function (error) {
                    Log.error(error);
                    return reply(Boom.gatewayTimeout('An error occurred.'))
                  });
              }
            },
            {
              assign: 'user',
              method: function (request, reply) {

                const email = request.payload.email;
                const password = request.payload.password;

                User.findByCredentials(email, password, Log)
                  .then(function (user) {
                    return reply(user);
                  })
                  .catch(function (error) {
                    Log.error(error);
                    return reply(Boom.gatewayTimeout('An error occurred.'))
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

                AuthAttempt.createInstance(ip, email, Log)
                  .then(function (authAttempt) {
                    return reply(Boom.badRequest('Invalid Email or Password.'));
                  })
                  .catch(function (error) {
                    Log.error(error);
                    return reply(Boom.gatewayTimeout('An error occurred.'))
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

                Session.createInstance(request.pre.user._id)
                  .then(function (session) {
                    return reply(session);
                  })
                  .catch(function (error) {
                    Log.error(error);
                    return reply(Boom.gatewayTimeout('An error occurred.'))
                  });
              }
            }
          ];

          const loginHandler = function (request, reply) {
            const credentials = request.pre.session._id.toString() + ':' + request.pre.session.key;
            const token = Token(request.pre.user, request.pre.session);

            const authHeader = Config.get('/restHapiConfig/auth') === 'simple'
              ? 'Basic ' + new Buffer(credentials).toString('base64')
              : 'Bearer ' + token;

            return reply({
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
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            },
          });
        },

        //Logout Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(Chalk.magenta("Logout"));
          const Session = mongoose.model('session');

          const collectionName = model.collectionDisplayName || model.modelName;

          const headersValidation = Joi.object({
            'authorization': Joi.string().required()
          }).options({ allowUnknown: true });

          Log.note("Generating Logout endpoint for " + collectionName);

          const logoutHandler = function (request, reply) {

            const credentials = request.auth.credentials || { session: {} };
            const session = credentials.session || {};

            Session.findByIdAndRemove(session._id)
              .then(function (sessionDoc) {

                if (!sessionDoc) {
                  return reply(Boom.notFound('Session not found.'));
                }

                return reply({ message: 'Success.' });
              })
              .catch(function (error) {
                Log.error(error);
                return reply(Boom.badImplementation('There was an error accessing the database.'));
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
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            }
          });
        },

        //Forgot Password Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(Chalk.magenta("Forgot Password"));
          const User = model;
          const Session = mongoose.model('session');

          const collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Forgot Password endpoint for " + collectionName);

          const forgotPasswordPre = [{
            assign: 'user',
            method: function (request, reply) {

              const conditions = {
                email: request.payload.email
              };

              User.findOne(conditions)
                .then(function (user) {
                  if (!user) {
                    return reply({ message: 'Success.' }).takeover();
                  }
                  return reply(user);
                })
                .catch(function (error) {
                  Log.error(error);
                  return reply(Boom.badImplementation('There was an error accessing the database.'));
                });
            }
          }];

          const forgotPasswordHandler = function (request, reply) {

            const mailer = request.server.plugins.mailer;

            let keyHash = {};
            let user = {};

            Session.generateKeyHash(Log)
              .then(function (result) {
                keyHash = result;

                const _id = request.pre.user._id.toString();
                const update = {
                  resetPassword: {
                    token: keyHash.hash,
                    expires: Date.now() + 10000000
                  }
                };

                return RestHapi.update(User, _id, update);
              })
              .then(function (result) {
                user = result;

                const firstName = user.firstName ? user.firstName : null;
                const lastName = user.lastName ? user.lastName : null;

                const emailOptions = {
                  subject: 'Reset your ' + Config.get('/websiteName') + ' password',
                  to: {
                    name: firstName + " " + lastName,
                    address: request.payload.email
                  }
                };

                const template = 'forgot-password';

                const token = Jwt.sign({
                  email: request.payload.email,
                  key: keyHash.key
                }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" });//TODO: match expiration with activateAccount expiration

                const context = {
                  clientURL: Config.get('/clientURL'),
                  websiteName: Config.get('/websiteName'),
                  key: token
                };

                return mailer.sendEmail(emailOptions, template, context, Log);
              })
              .then(function (result) {
                return reply({ message: 'Success.' });
              })
              .catch(function (error) {
                Log.error(error);
                return reply(Boom.gatewayTimeout('An error occurred.'))
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
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            }
          });
        },

        //Reset Password Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(Chalk.magenta("Reset Password"));
          const User = model;

          const collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Reset Password endpoint for " + collectionName);

          const resetPasswordPre = [
            {
              assign: 'decoded',
              method: function (request, reply) {

                Jwt.verify(request.payload.token, Config.get('/jwtSecret'), function (err, decoded) {
                  if (err) {
                    return reply(Boom.badRequest('Invalid email or key.'));
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
                  'resetPassword.expires': { $gt: Date.now() }
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
            }];

          const resetPasswordHandler = function (request, reply) {

            const key = request.pre.decoded.key;
            const token = request.pre.user.resetPassword.token;
            Bcrypt.compare(key, token)
              .then(function (keyMatch) {
                if (!keyMatch) {
                  return reply(Boom.badRequest('Invalid email or key.'));
                }

                return User.generatePasswordHash(request.payload.password, Log);
              })
              .then(function (passwordHash) {

                const _id = request.pre.user._id.toString();
                const update = {
                  $set: {
                    password: passwordHash.hash
                  },
                  $unset: {
                    resetPassword: undefined
                  }
                };

                return RestHapi.update(User, _id, update);
              })
              .then(function (result) {
                return reply({ message: 'Success.' });
              })
              .catch(function (error) {
                Log.error(error);
                return reply(Boom.gatewayTimeout('An error occurred.'))
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
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            }
          });
        },

        //Check Email Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(Chalk.magenta("Check Email"));
          const User = model;

          const collectionName = model.collectionDisplayName || model.modelName;

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
                  email: Joi.string().email().required()
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
        },

        //Registration Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(Chalk.magenta("Register"));
          const User = model;
          const Session = mongoose.model('session');

          const collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Registration endpoint for " + collectionName);

          const registerPre = [{
            assign: 'emailCheck',
            method: function (request, reply) {

              const conditions = {
                email: request.payload.email
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

                originalPassword = user.password;

                user.isActive = false;
                user.activateAccount = {
                  token: keyHash.hash,
                  expires: Date.now() + 10000000 //TODO: set token expiration in config
                };

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
                  }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" });//TODO: match expiration with activateAccount expiration

                  const context = {
                    clientURL: Config.get('/clientURL'),
                    websiteName: Config.get('/websiteName'),
                    key: token
                  };

                  mailer.sendEmail(emailOptions, template, context, Log)
                    .catch(function (error) {
                      Log.error('sending welcome email failed:', error);
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
                  }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" });//TODO: match expiration with activateAccount expiration

                  const invitee = request.auth.credentials ? request.auth.credentials.user : {
                    firstName: "Appy",
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
                    });
                }

                return Session.createInstance(user._id.toString());
              })
              .then(function (session) {
                const credentials = session._id + ':' + session.key;
                const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');

                return reply({
                  user: user,
                  session: session,
                  id_token: Token(user, session),
                  authHeader
                });
              })
              .catch(function (error) {
                Log.error(error);
                return reply(Boom.gatewayTimeout('An error occurred.'))
              });
          };

          const auth = Config.get('/restHapiConfig/auth') === false
            ? false
            : { mode: 'optional', strategy: Config.get('/restHapiConfig/auth') };

          server.route({
            method: 'POST',
            path: '/user/register',
            config: {
              handler: registerHandler,
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
                }
              }
            }
          });
        },

        //Send Activation Email Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(Chalk.magenta("Send Activation Email"));
          const User = model;
          const Session = mongoose.model('session');

          const collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Send Activation Email endpoint for " + collectionName);

          const sendActivationEmailPre = [
            {
              assign: 'user',
              method: function (request, reply) {

                const email = request.payload.email;

                User.findOne({ email: email })
                  .then(function (user) {
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

                const document = {
                  activateAccount: {
                    token: keyHash.hash,
                    expires: Date.now() + 10000000 //TODO: set token expiration in config
                  }
                };

                return RestHapi.update(User, request.pre.user._id, document);
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
                }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" });//TODO: match expiration with activateAccount expiration


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
                Log.error(error);
                return reply(Boom.gatewayTimeout('An error occurred.'))
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
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            }
          });
        },

        //Account Activation Endpoint
        function (server, model, options, Log) {
          Log = Log.bind(Chalk.magenta("Activate Account"));
          const User = model;

          const collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Account Activation endpoint for " + collectionName);

          const accountActivationPre = [
            {
              assign: 'decoded',
              method: function (request, reply) {

                Jwt.verify(request.query.token, Config.get('/jwtSecret'), function (err, decoded) {
                  if (err) {
                    return reply(Boom.badRequest('Invalid email or key.'));
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
                  'activateAccount.expires': { $gt: Date.now() }
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
            const token = request.pre.user.activateAccount.token;

            Bcrypt.compare(key, token)
              .then(function (keyMatch) {
                if (!keyMatch) {
                  return reply(Boom.badRequest('Invalid email or key.'));
                }

                const _id = request.pre.user._id.toString();
                const update = {
                  $set: {
                    isActive: true
                  },
                  $unset: {
                    activateAccount: undefined
                  }
                };

                return RestHapi.update(User, _id, update);
              })
              .then(function (result) {
                return reply({ message: 'Success.' });
              })
              .catch(function (error) {
                Log.error(error);
                return reply(Boom.gatewayTimeout('An error occurred.'))
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
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            }
          });
        },
      ],
      create: {
        pre: function (payload, Log) {

          return mongoose.model('user').generatePasswordHash(payload.password, Log)
            .then(function (hashedPassword) {
              payload.password = hashedPassword.hash;
              return payload;
            });
        }
      }
    },

    generatePasswordHash: function (password, Log) {

      return Bcrypt.genSalt(10)
        .then(function (salt) {
          return Bcrypt.hash(password, salt);
        })
        .then(function (hash) {
          return { password, hash }
        })
    },

    findByCredentials: function (email, password, Log) {

      const self = this;

      const query = {
        email: email
      };

      let user = {};

      return self.findOne(query)
        .then(function (result) {
          user = result;

          if (!user) {
            return false;
          }

          const source = user.password;

          return Bcrypt.compare(password, source);
        })
        .then(function (passwordMatch) {
          if (passwordMatch) {
            return user;
          }
        });
    }
  };

  return Schema;
};
