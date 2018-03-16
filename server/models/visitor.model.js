'use strict';

module.exports = function (mongoose) {
  var modelName = "visitor";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    ip: {
      type: Types.String,
      required: true
    },
    browser: {
      type: Types.String,
      required: true
    },
    country_code: {
      type: Types.String
    },
    country_name: {
      type: Types.String
    },
    region_code: {
      type: Types.String
    },
    region_name: {
      type: Types.String
    },
    city: {
      type: Types.String
    },
    zip_code: {
      type: Types.String
    },
    time_zone: {
      type: Types.String
    },
    latitude: {
      type: Types.Number
    },
    longitude: {
      type: Types.Number
    },
    metro_code: {
      type: Types.Number
    }
  }, { collection: modelName });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      policies: {
      },
      associations: {
      },
      allowCreate: false,
      allowUpdate: false,
      allowDelete: false
    }
  };
  
  return Schema;
};