var Q = require('q');
var Joi = require('joi');
const Async = require('async');
const Config = require('../../config');

module.exports = function (mongoose) {
  var modelName = "authAttempt";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true
    },
    ip: {
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
      alias: "auth-attempt"
    },
    createInstance: function(ip, email, callback) {

      const document = {
        ip,
        email: email.toLowerCase(),
        time: new Date()
      };

      mongoose.model('authAttempt').create(document, (err, docs) => {

        if (err) {
          return callback(err);
        }

        callback(null, docs[0]);
      });
    },

    abuseDetected: function(ip, email, callback) {

      const self = this;

      Async.auto({
        abusiveIpCount: function (done) {

          const query = { ip };
          self.count(query, done);
        },
        abusiveIpUserCount: function (done) {

          const query = {
            ip,
            email: email.toLowerCase()
          };

          self.count(query, done);
        }
      }, (err, results) => {

        if (err) {
          return callback(err);
        }

        const authAttemptsConfig = Config.get('/authAttempts');
        const ipLimitReached = results.abusiveIpCount >= authAttemptsConfig.forIp;
        const ipUserLimitReached = results.abusiveIpUserCount >= authAttemptsConfig.forIpAndUser;

        callback(null, ipLimitReached || ipUserLimitReached);
      });
    }
  };
  
  return Schema;
};
