'use strict';

const Chalk = require('chalk');
const _ = require('lodash');

const Config = require('../config/config');

const USER_ROLES = Config.get('/constants/USER_ROLES');

module.exports = function (server, mongoose, logger) {

  // Create the notification subscription
  (function () {
    const Log = logger.bind(Chalk.magenta("Notification Subscription"));

    server.subscription('/notification/{userId}', {
      filter: function (path, message, options, next) {
        next(true);
      },
      auth: {
        scope: ['root', 'receiveNotifications', '!-receiveNotifications'],
        entity: 'user',
        index: true
      },
      onSubscribe: function (socket, path, params, next) {
        next();
      }
    });
  }())

};
