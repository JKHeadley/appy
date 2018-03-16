'use strict';

const Q = require('q');
const RestHapi = require('rest-hapi');
const _ = require('lodash');

const Config = require('../../config');
const notificationUpdateAuth = require('../policies/notificationAuth');

const NOTIFICATION_TYPES = Config.get('/constants/NOTIFICATION_TYPES');

//TODO: policy/etc to give primary user root access
//TODO: add an event type
module.exports = function (mongoose) {
  var modelName = "notification";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    type: {
      type: Types.String,
      enum: _.values(NOTIFICATION_TYPES),
      required: true,
    },
    hasRead: {
      type: Types.Boolean,
      required: true,
      default: false
    },
    primaryUser: {
      type: Types.ObjectId,
      ref: "user"
    },
    actingUser: {
      type: Types.ObjectId,
      ref: "user"
    },
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      policies: {
        // EXPL: only the primaryUser can update a notification
        updatePolicies: [notificationUpdateAuth(mongoose)]
      },
      associations: {
        primaryUser: {
          type: "MANY_ONE",
          model: "user"
        },
        actingUser: {
          type: "ONE_ONE",
          model: "user",
          // duplicate: ['firstName', 'lastName', 'profileImageUrl']
        },
      }
    },
    /**
     * Create a notification based on a new or updated connection
     * @param connnection: used to set the user properties
     * @param connectionPayload: used to determine the notification type
     * @param server
     * @param Log
     */
    createConnectionNotification (connnection, connectionPayload, server, Log) {
      const Notification = mongoose.model('notification');
      const User = mongoose.model('user');
      let notification = {
        primaryUser: connnection.connectedUser,
        actingUser: connnection.primaryUser
      }
      if (connectionPayload.isContact) {
        notification.type = NOTIFICATION_TYPES.CONTACT
      } else if (connectionPayload.isFollowing) {
        notification.type = NOTIFICATION_TYPES.FOLLOW
      }
      if (notification.type) {
        let promises = []
        promises.push(RestHapi.create(Notification, notification, Log))
        promises.push(RestHapi.find(User, notification.actingUser, { $select: ['firstName', 'lastName', 'profileImageUrl']},  Log))
        Q.all(promises)
          .then(function (result) {
            let notification = result[0]
            notification.actingUser = result[1]
            server.publish('/notification/' + notification.primaryUser, notification);
          })
          .catch(function (error) {
            Log.error(error);
          })
      }
    },
    /**
     * Create a notification based on a shared document
     * @param notification: object used to create the notification
     * @param server
     * @param Log
     */
    createDocumentNotification (notification, server, Log) {
      const Notification = mongoose.model('notification');
      const User = mongoose.model('user');
      let promises = []
      promises.push(RestHapi.create(Notification, notification, Log))
      promises.push(RestHapi.find(User, notification.actingUser, { $select: ['firstName', 'lastName', 'profileImageUrl']},  Log))
      Q.all(promises)
        .then(function (result) {
          let notification = result[0]
          notification.actingUser = result[1]
          server.publish('/notification/' + notification.primaryUser, notification);
        })
        .catch(function (error) {
          Log.error(error);
        })
    }
  };

  return Schema;
};