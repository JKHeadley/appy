'use strict';

const Boom = require('boom');
const Config = require('../../config');
const Q = require('q');
const Mongoose = require('mongoose');


const internals = {};


internals.applyStrategy = function (server, next) {

  const Session = Mongoose.model('session');
  const User = Mongoose.model('user');

  server.auth.strategy('simple', 'basic', {
    validateFunc: function (request, email, password, callback) {

      // Async.auto({
      //     session: function (done) {
      //
      //         Session.findByCredentials(email, password, done);
      //     },
      //     user: ['session', function (results, done) {
      //
      //         if (!results.session) {
      //             return done();
      //         }
      //
      //         User.findById(results.session.user, done);
      //     }],
      //     roles: ['user', function (results, done) {
      //
      //         if (!results.user) {
      //             return done();
      //         }
      //
      //         results.user.hydrateRoles(done);
      //     }],
      //     scope: ['user', function (results, done) {
      //
      //         if (!results.user || !results.user.roles) {
      //             return done();
      //         }
      //
      //         done(null, Object.keys(results.user.roles));
      //     }]
      // }, (err, results) => {
      //
      //     if (err) {
      //         return callback(err);
      //     }
      //
      //     if (!results.session) {
      //         return callback(null, false);
      //     }
      //
      //     callback(null, Boolean(results.user), results);
      // });
    }
  });


  next();
};

internals.applyJwtStrategy = function (server, next) {

  const Session = Mongoose.model('session');
  const User = Mongoose.model('user');

  server.auth.strategy('jwt', 'jwt', {
    key: Config.get('/jwtSecret'),
    verifyOptions: { algorithms: ['HS256'] },

    validateFunc: function (decodedToken, request, callback) {

      let session = {};
      let user = {};

      Session.findByCredentials(decodedToken.sessionId, decodedToken.sessionKey)
        .then(function (result) {
          session = result;

          if (!session) {
            return Q.when();
          }

          return User.findById(session.user);
        })
        .then(function (result) {
          user = result;

          if (!session) {
            return callback(null, false);
          }

          callback(null, Boolean(user), { session, user });
        });

      //TODO: populate user role for scope
      // roles: ['user', function (results, done) {
      //
      //   console.log("user", results.user);
      //   if (!results.user) {
      //     return done();
      //   }
      //
      //   done(null,)
      // }],
      // scope: ['user', function (results, done) {
      //
      //   if (!results.user || !results.user.roles) {
      //     return done();
      //   }
      //
      //   done(null, Object.keys(results.user.roles));
      // }]
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


exports.register = function (server, options, next) {

  if (Config.get('/authStrategy') === 'simple') {
    server.dependency([], internals.applyStrategy);
  }
  else {
    server.dependency(['hapi-auth-jwt2'], internals.applyJwtStrategy);
  }

  next();
};

exports.preware = internals.preware;

exports.applyJwtStrategy = internals.applyJwtStrategy;

exports.register.attributes = {
  name: 'auth'
};
