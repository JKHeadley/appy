var mongoose = require('mongoose')

module.exports = function() {
  var Types = mongoose.Schema.Types

  var Model = {
    Schema: {
      canEdit: {
        type: Types.Boolean,
        default: false
      }
    },
    modelName: 'user_document'
  }

  return Model
}
