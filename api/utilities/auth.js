'use strict';

const Boom = require('boom');
const Mongoose = require('mongoose');

const Config = require('../../config');
const Token = require('../utilities/token');

const AUTH_STRATEGIES = Config.get('/constants/AUTH_STRATEGIES');
const expirationPeriod = Config.get('/expirationPeriod');

const internals = {};


internals.applyTokenStrategy = function (server, Log, next) {
  Log = Log.bind("auth/standard-jwt");

  server.auth.strategy(AUTH_STRATEGIES.TOKEN, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validateFunc: function (decodedToken, request, callback) {

      let user = decodedToken.user;

      callback(null, Boolean(user), { user });
    }
  });

  //next();
};

internals.applySessionStrategy = function (server, Log, next) {
  Log = Log.bind("auth/session");

  const Session = Mongoose.model('session');
  const User = Mongoose.model('user');

  server.auth.strategy(AUTH_STRATEGIES.SESSION, 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validateFunc: function (decodedToken, request, callback) {

      const sessionId = decodedToken.sessionId;
      const sessionKey = decodedToken.sessionKey;
      const passwordHash = decodedToken.passwordHash;
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
              request.response.header('X-Auth-Header', "Bearer " + Token(null, session, expirationPeriod.long, Log));
            }

            return reply.continue();
          });

          callback(null, Boolean(user), { session, user })
        })
        .catch(function(error) {
          Log.error(error);
        });
    }
  });


  // next();
};

internals.applyRefreshStrategy = function (server, Log, next) {
  Log = Log.bind("auth/refresh");

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

        callback(null, Boolean(user), { user });
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
                request.response.header('X-Auth-Header', "Bearer " + Token(user, null, expirationPeriod.short, Log));
                request.response.header('X-Refresh-Token', Token(null, session, expirationPeriod.long, Log));
              }

              return reply.continue();
            });
            
            callback(null, Boolean(user), { user, session });
          })
          .catch(function(error) {
            Log.error(error);
          });
      }
    }
  });

  //next();
};

internals.preware = {
  ensureNotRoot: {
    assign: 'ensureNotRoot',
    method: function (request, reply) {

      if (request.auth.credentials.user.email === 'admin@scal.io') {
        const message = 'Not permitted for root user.';

        return reply(Boom.badRequest(message));
      }

      reply();
    }
  },
  ensureAdminGroup: function (groups) {

    return {
      assign: 'ensureAdminGroup',
      method: function (request, reply) {

        if (Object.prototype.toString.call(groups) !== '[object Array]') {
          groups = [groups];
        }

        const groupFound = groups.some((group) => {

          return request.auth.credentials.roles.admin.isMemberOf(group);
        });

        if (!groupFound) {
          return reply(Boom.notFound('Permission denied to this resource.'));
        }

        reply();
      }
    };
  }
};

internals.getCurrentStrategy = (function() {
  const auth = Config.get('/restHapiConfig/auth');

  switch (auth) {
    case AUTH_STRATEGIES.TOKEN:
      return internals.applyTokenStrategy;
    case AUTH_STRATEGIES.SESSION:
      return internals.applySessionStrategy;
    case AUTH_STRATEGIES.REFRESH:
      return internals.applyRefreshStrategy;
    default:
      return internals.applyTokenStrategy;
  }
})();


exports.register = function (server, options, next) {

  if (Config.get('/authStrategy') === 'jwt-with-session') {
    server.dependency([], internals.applySessionStrategy);
  }
  else {
    server.dependency(['hapi-auth-jwt2'], internals.applyTokenStrategy);
  }

  next();
};

exports.preware = internals.preware;

exports.applyTokenStrategy = internals.applyTokenStrategy;

exports.getCurrentStrategy = internals.getCurrentStrategy;

exports.register.attributes = {
  name: 'auth'
};
