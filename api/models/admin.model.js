'use strict';

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
    }
  };
  
  return Schema;
};
