'use strict';

const AuthPlugin = require('./auth');
const Jwt = require('jsonwebtoken');
const Config = require('../../config');

function createToken(user, session) {
  var scopes;

  // scopes to admin
  // if (AuthPlugin.preware.ensureAdminGroup('root')) {
  scopes = 'admin';
  // }

  // Sign the JWT
  return Jwt.sign({
    id: user._id,
    email: user.email,
    sessionId: session._id.toString(),
    sessionKey: session.key,
    scope: scopes
  }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: "4h" });
}

module.exports = createToken;