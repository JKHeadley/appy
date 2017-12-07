'use strict';

const Bcrypt = require('bcryptjs');
const Chalk = require('chalk');
const GeneratePassword = require('password-generator');

module.exports = function (mongoose) {
  const modelName = "user";
  const Types = mongoose.Schema.Types;
  const Schema = new mongoose.Schema({
    isActive: {
      type: Types.Boolean,
      allowOnUpdate: false,
      default: false
    },
    isEnabled: {
      type: Types.Boolean,
      allowOnUpdate: false,
      default: true
    },
    password: {
      type: Types.String,
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
    resetPasswordHash: {
      allowOnCreate: false,
      allowOnUpdate: false,
      exclude: true,
      type: Types.String
    },
    activateAccountHash: {
      allowOnCreate: false,
      allowOnUpdate: false,
      exclude: true,
      type: Types.String
    }
  }, { collection: modelName });

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role",
          duplicate: [{
            field: 'name'
          }]
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
      allowCreate: false,
      create: {
        pre: function (payload, request, Log) {

          if (!payload.password) {
            payload.password = GeneratePassword(10, false);
          }

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
