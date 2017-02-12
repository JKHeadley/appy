'use strict';

const Bcrypt = require('bcryptjs');
const Uuid = require('node-uuid');

module.exports = function (mongoose) {
  const modelName = "session";
  const Types = mongoose.Schema.Types;
  const Schema = new mongoose.Schema({
    user: {
      type: Types.ObjectId,
      ref: "user"
    },
    key: {
      type: Types.String,
      required: true
    },
    passwordHash: {
      type: Types.String,
      required: true
    }
  }, { collection: modelName });

  Schema.statics = {
    collectionName: modelName,
    enableSoftDelete: false,
    routeOptions: {
      associations: {
        user: {
          type: "ONE_ONE",
          model: "user"
        }
      }
    },

    generateKeyHash: function (Log) {

      const key = Uuid.v4();

      return Bcrypt.genSalt(10)
        .then(function (salt) {
          return Bcrypt.hash(key, salt);
        })
        .then(function (hash) {
          return { key, hash };
        });
    },

    createInstance: function (user, Log) {

      let newSession = {};

      const document = {
        user: user._id,
        key: Uuid.v4(),
        passwordHash: user.password,
        createdAt: Date.now()
      };

      return mongoose.model('session').create(document)
        .then(function (result) {
          newSession = result;

          const query = {
            user: user._id,
            key: { $ne: document.key }
          };

          return mongoose.model('session').findOneAndRemove(query);
        })
        .then(function (result) {
          return newSession;
        });
    },

    findByCredentials: function (_id, key, Log) {

      let session = {};

      return mongoose.model('session').findById(_id)
        .then(function (result) {
          session = result;
          if (!session) {
            return false;
          }

          return session.key === key ? session : false;
        });
    }
  };

  return Schema;
};
