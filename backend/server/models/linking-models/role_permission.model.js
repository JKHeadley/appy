var mongoose = require("mongoose");

const _ = require('lodash');
const Config = require('../../config/config');

const PERMISSION_STATES = Config.get('/constants/PERMISSION_STATES');

module.exports = function () {

  var Types = mongoose.Schema.Types;

  var Model = {
    Schema: {
      state: {
        type: Types.String,
        enum: _.values(PERMISSION_STATES),
        required: true,
        default: PERMISSION_STATES.INCLUDED
      }
    },
    modelName: "role_permission"
  };

  return Model;
};
