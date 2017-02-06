'use strict';

const Jwt = require('jsonwebtoken');
const Config = require('../config');

function createToken(user, session, expirationPeriod, Log) {
  Log = Log.bind("token");

  let token = {};

  if (session) {
    token = Jwt.sign({
      sessionId: session._id,
      sessionKey: session.key,
      passwordHash: session.passwordHash
    }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: expirationPeriod });
  }
  else {
    const tokenUser ={
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    token = Jwt.sign({
      user: tokenUser
    }, Config.get('/jwtSecret'), { algorithm: 'HS256', expiresIn: expirationPeriod });
  }

  return token;
}

module.exports = createToken;