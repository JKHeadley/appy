'use strict';

const _ = require('lodash');
const RestHapi = require('rest-hapi');

const Config = require('../../config');

const USER_ROLES = Config.get('/constants/USER_ROLES');

// TODO: only primary user should be able to access this
module.exports = function (mongoose) {
  var modelName = "connection";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    primaryUser: {
      type: Types.ObjectId,
      ref: "user"
    },
    connectedUser: {
      type: Types.ObjectId,
      ref: "user"
    },
    isFollowing: {
      type: Types.Boolean,
      default: false
    },
    isFollowed: {
      type: Types.Boolean,
      default: false
    },
    isContact: {
      type: Types.Boolean,
      default: false
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      routeScope: {
        rootScope: _.values(USER_ROLES)
      },
      associations: {
        primaryUser: {
          type: "MANY_ONE",
          model: "user",
        },
        connectedUser: {
          type: "ONE_ONE",
          model: "user",
        },
      },
      create: {
        pre: function (payload, request, Log) {
          const Connection = mongoose.model('connection');
          if (!payload.isSecondary) {
            const secondaryPayload = {
              isSecondary: true
            }
            if (payload.connectedUser) { secondaryPayload.primaryUser = payload.connectedUser }
            if (payload.primaryUser) { secondaryPayload.connectedUser = payload.primaryUser }
            if (payload.isContact) { secondaryPayload.isContact = payload.isContact }
            if (payload.isFollowed) { secondaryPayload.isFollowing = payload.isFollowed }
            if (payload.isFollowing) { secondaryPayload.isFollowed = payload.isFollowing }

            return RestHapi.create(Connection, secondaryPayload, Log)
              .then(function (result) {
                return payload
              })
          }
          else {
            delete payload.isSecondary
            return payload
          }

        }
      },
      update: {
        pre: function (_id, payload, request, Log) {
          const Connection = mongoose.model('connection');
          if (!payload.isSecondary) {
            const secondaryPayload = {
              isSecondary: true
            }
            if (payload.connectedUser) { secondaryPayload.primaryUser = payload.connectedUser }
            if (payload.primaryUser) { secondaryPayload.connectedUser = payload.primaryUser }
            if (payload.isContact) { secondaryPayload.isContact = payload.isContact }
            if (payload.isFollowed) { secondaryPayload.isFollowing = payload.isFollowed }
            if (payload.isFollowing) { secondaryPayload.isFollowed = payload.isFollowing }

            return RestHapi.find(Connection, _id, {}, Log)
              .then(function (result) {
                if (!result) {
                  throw "Connection not found."
                }
                return RestHapi.list(Connection, {
                  primaryUser: result.connectedUser,
                  connectedUser: result.primaryUser
                }, Log)
              })
              .then(function (result) {
                if (!result.docs[0]) {
                  throw "Secondary connection not found."
                }
                return RestHapi.update(Connection, result.docs[0]._id, secondaryPayload, Log)
                  .then(function (result) {
                    return payload
                  })
              })
          }
          else {
            delete payload.isSecondary
            return payload
          }

        }
      }
    }
  };

  // EXPL: This model acts as a one-way association between two users
  Schema.index({ primaryUser: 1, connectedUser: 1 }, { unique: true });

  return Schema;
};