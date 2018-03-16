var mongoose = require("mongoose");

module.exports = function () {

  var Types = mongoose.Schema.Types;

  var Model = {
    Schema: {
      // EXPL: This property is true if the user has read all the messages, false if there are new messages that
      // the user hasn't read
      hasRead: {
        type: Types.Boolean,
        required: true,
        default: false
      },
    },
    modelName: "user_conversation"
  };

  return Model;
};