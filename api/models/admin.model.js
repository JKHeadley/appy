'use strict';

module.exports = function (mongoose) {
  const modelName = "admin";
  const Types = mongoose.Schema.Types;
  const Schema = new mongoose.Schema({
    user: {
      type: Types.ObjectId,
      ref: "user"
    }
  }, { collection: modelName });

  Schema.statics = {
    collectionName: modelName,
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
