'use strict';

const Mongoose = require('mongoose');
const RestHapi = require('rest-hapi');

const Config = require('../config');
const Token = require('./token');

const AUTH_STRATEGIES = Config.get('/constants/AUTH_STRATEGIES');
const expirationPeriod = Config.get('/expirationPeriod');

const logger = RestHapi.getLogger('appy');

const internals = {};


internals.applyTokenStrategy = function (server, next) {
  const Log = logger.bind("auth/standard-jwt");

  server.auth.strategy(AUTH_STRATEGIES.TOKEN, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validateFunc: function (decodedToken, request, callback) {

      let user = decodedToken.user;

      callback(null, Boolean(user), { user, scope: decodedToken.scope });
    }
  });

  next();
};

internals.applySessionStrategy = function (server, next) {
  const Log = logger.bind("auth/session");

  server.auth.strategy(AUTH_STRATEGIES.SESSION, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validateFunc: function (decodedToken, request, callback) {

      const Session = Mongoose.model('session');
      const User = Mongoose.model('user');

      const sessionId = decodedToken.sessionId;
      const sessionKey = decodedToken.sessionKey;
      const passwordHash = decodedToken.passwordHash;
      const scope = decodedToken.scope;
      let session = {};
      let user = {};

      Session.findByCredentials(sessionId, sessionKey, Log)
        .then(function(result) {
          session = result;

          if (!session) {
            return callback(null, false);
          }

          return User.findById(session.user);
        })
        .then(function(result) {
          if (result === false) {
            return result;
          }
          user = result;

          if (!user) {
            return callback(null, false);
          }

          if (user.password !== passwordHash) {
            return callback(null, false);
          }

          server.ext('onPreResponse', function(request, reply) {

            if (request.response.header) {
              request.response.header('X-Auth-Header', "Bearer " + Token(null, session, scope, expirationPeriod.long, Log));
            }

            return reply.continue();
          });

          callback(null, Boolean(user), { session, user, scope: scope });
        })
        .catch(function(error) {
          Log.error(error);
        });
    }
  });

  next();
};

internals.applyRefreshStrategy = function (server, next) {
  const Log = logger.bind("auth/refresh");

  server.auth.strategy(AUTH_STRATEGIES.REFRESH, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validateFunc: function (decodedToken, request, callback) {

      let user = {};
      let session = {};

      //EXPL: if the token does not contain session info, then simply authenticate and continue
      if (decodedToken.user) {
        user = decodedToken.user;

        server.ext('onPreResponse', function(request, reply) {

          if (request.response.header) {
            request.response.header('X-Auth-Header', undefined);
            request.response.header('X-Refresh-Token', undefined);
          }

          return reply.continue();
        });

        callback(null, Boolean(user), { user, scope: decodedToken.scope });
      }
      // EXPL: if the token does contain session info (i.e. a refresh token), then use the session to
      // authenticate and respond with a fresh set of tokens in the header
      else if (decodedToken.sessionId) {
        const Session = Mongoose.model('session');
        const User = Mongoose.model('user');

        Session.findByCredentials(decodedToken.sessionId, decodedToken.sessionKey, Log)
          .then(function(result) {
            session = result;

            if (!session) {
              return callback(null, false);
            }

            return User.findById(session.user);
          })
          .then(function(result) {
            if (result === false) {
              return result;
            }
            user = result;

            if (!user) {
              return callback(null, false);
            }

            if (user.password !== decodedToken.passwordHash) {
              return callback(null, false);
            }

            server.ext('onPreResponse', function(request, reply) {

              if (request.response.header) {
                request.response.header('X-Auth-Header', "Bearer " + Token(user, null, decodedToken.scope, expirationPeriod.short, Log));
                request.response.header('X-Refresh-Token', Token(null, session, decodedToken.scope, expirationPeriod.long, Log));
              }

              return reply.continue();
            });

            callback(null, Boolean(user), { user, session, scope: decodedToken.scope });
          })
          .catch(function(error) {
            Log.error(error);
          });
      }
    }
  });

  next();
};


exports.register = function (server, options, next) {
  const authStrategy = Config.get('/restHapiConfig/authStrategy');

  switch (authStrategy) {
    case AUTH_STRATEGIES.TOKEN:
      internals.applyTokenStrategy(server, next);
      break;
    case AUTH_STRATEGIES.SESSION:
      internals.applySessionStrategy(server, next);
      break;
    case AUTH_STRATEGIES.REFRESH:
      internals.applyRefreshStrategy(server, next);
      break;
    default:
      next();
      break;
  }

};

exports.register.attributes = {
  name: 'auth'
};
