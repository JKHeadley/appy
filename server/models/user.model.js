'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcryptjs');
const Chalk = require('chalk');

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
      type: Types.String,
      required: true
    },
    lastName: {
      type: Types.String,
      required: true
    },
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    role: {
      type: Types.ObjectId,
      ref: "role"
    },
    resetPassword: {
      token: {
        allowOnCreate: false,
        allowOnUpdate: false,
        exclude: true,
        type: Types.String
      },
      expires: {
        allowOnCreate: false,
        allowOnUpdate: false,
        exclude: true,
        type: Types.Date
      }
    },
    activateAccount: {
      token: {
        allowOnCreate: false,
        allowOnUpdate: false,
        exclude: true,
        type: Types.String
      },
      expires: {
        allowOnCreate: false,
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
        role: {
          type: "MANY_ONE",
          model: "role"
        },
        groups: {
          type: "MANY_MANY",
          alias: "group",
          model: "group"
        },
        permissions: {
          type: "MANY_MANY",
          alias: "permission",
          model: "permission",
          linkingModel: "user_permission"
        }
      },
      extraEndpoints: [
        // Check Email Endpoint
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
          return { password, hash };
        });
    },

    findByCredentials: function (email, password, Log) {

      const self = this;

      const query = {
        email: email.toLowerCase(),
      };

      let user = {};

      return self.findOne(query).lean()
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
