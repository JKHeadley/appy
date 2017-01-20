var Q = require('q');
var Joi = require('joi');
const Async = require('async');

module.exports = function (mongoose) {
  var modelName = "admin";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    user: {
      type: Types.ObjectId,
      ref: "user"
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
    createInstance: function(name, callback) {

      const nameParts = name.trim().split(/\s/);

      const document = {
        name: {
          first: nameParts.shift(),
          middle: nameParts.length > 1 ? nameParts.shift() : undefined,
          last: nameParts.join(' ')
        },
        createdAt: new Date()
      };

      this.insertOne(document, (err, docs) => {

        if (err) {
          return callback(err);
        }

        callback(null, docs[0]);
      });
    },

    findByUsername: function(username, callback) {

      const query = { 'user.name': username.toLowerCase() };

      this.findOne(query, callback);
    }
  };
  
  return Schema;
};
