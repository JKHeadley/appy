var Q = require('q');
var Joi = require('joi');
const Async = require('async');
const Bcrypt = require('bcrypt');
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
    generateKeyHash: function(callback) {

      const key = Uuid.v4();

      Async.auto({
        salt: function (done) {

          Bcrypt.genSalt(10, done);
        },
        hash: ['salt', function (results, done) {

          Bcrypt.hash(key, results.salt, done);
        }]
      }, (err, results) => {

        if (err) {
          return callback(err);
        }

        callback(null, {
          key,
          hash: results.hash
        });
      });
    },

    createInstance: function(userId, callback) {

      const self = this;

      Async.auto({
        keyHash: this.generateKeyHash.bind(this),
        newSession: ['keyHash', function (results, done) {

          const document = {
            user: userId,
            key: results.keyHash.hash,
            time: new Date(),
          };

          mongoose.model('session').create(document).then(function(newSession) {
            done(null, newSession);
          })
          .catch(function(err) {
            done(err, null);
          });
        }],
        clean: ['newSession', function (results, done) {

          const query = {
            user: userId,
            key: { $ne: results.keyHash.hash }
          };

          mongoose.model('session').findOneAndRemove(query).then(function(deleted) {
            done(null, deleted);
          });
        }]
      }, (err, results) => {

        if (err) {
          return callback(err);
        }

        results.newSession.key = results.keyHash.key;

        callback(null, results.newSession);
      });
    },

    findByCredentials: function(id, key, callback) {

      Async.auto({
        session: function (done) {

          mongoose.model('session').findById(id, done);
        },
        keyMatch: ['session', function (results, done) {

          if (!results.session) {
            return done(null, false);
          }

          const source = results.session.key;
          Bcrypt.compare(key, source, done);
        }]
      }, (err, results) => {

        if (err) {
          return callback(err);
        }

        if (results.keyMatch) {
          return callback(null, results.session);
        }

        callback();
      });
    }
  };
  
  return Schema;
};
