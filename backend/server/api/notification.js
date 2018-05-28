'use strict'

// const Chalk = require('chalk')

module.exports = function(server, mongoose, logger) {
  // Create the notification subscription
  ;(function() {
    // const Log = logger.bind(Chalk.magenta('Notification Subscription'))

    server.subscription('/notification/{userId}', {
      filter: function(path, message, options) {
        return true
      },
      auth: {
        scope: ['root', 'receiveNotifications', '!-receiveNotifications'],
        entity: 'user',
        index: true
      },
      onSubscribe: function(socket, path, params) {
        return
      }
    })
  })()
}
