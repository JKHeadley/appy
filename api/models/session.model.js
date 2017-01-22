'use strict';

const Bcrypt = require('bcryptjs');
const Uuid = require('node-uuid');

module.exports = function (mongoose) {
  var modelName = "session";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    user: {
      type: Types.ObjectId,
      ref: "user"
    },
    key: {
      type: Types.String,
      required: true
    },
    time: {
      type: Types.Date,
      required: true
    }
  }, { collection: modelName });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        user: {
          type: "ONE_ONE",
          model: "user"
        }
      }
    },
    generateKeyHash: function(Log) {

      const key = Uuid.v4();

      return Bcrypt.genSalt(10)
          .then(function(salt) {
              return Bcrypt.hash(key, salt);
          })
          .then(function(hash) {
              return { key, hash }
          })
    },

    createInstance: function(userId, Log) {
        const self = this;
        let keyHash = {},
            newSession = {};

        return self.generateKeyHash()
            .then(function(result) {
                keyHash = result;

                const document = {
                    user: userId,
                    key: keyHash.hash,
                    time: new Date(),
                };

                return mongoose.model('session').create(document);
            })
            .then(function(result) {
                newSession = result;

                const query = {
                    user: userId,
                    key: { $ne: keyHash.hash }
                };

                return mongoose.model('session').findOneAndRemove(query);
            })
            .then(function(result) {
                newSession.key = keyHash.key;

                return newSession;
            })
    },

    findByCredentials: function(_id, key, Log) {

        let session = {};

        return mongoose.model('session').findById(_id)
            .then(function(result) {
                session = result;
                if (!session) {
                    return false;
                }

                const source = session.key;
                return Bcrypt.compare(key, source);
            })
            .then(function(keyMatch) {
                if (keyMatch) {
                    return session;
                }
            });
    }
  };
  
  return Schema;
};
