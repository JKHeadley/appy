'use strict'

const Jwt = require('jsonwebtoken')
const Config = require('../config/config')

function createToken(user, session, scope, expirationPeriod, Log) {
  Log = Log.bind('token')

  let token = {}

  if (session) {
    token = Jwt.sign(
      {
        sessionId: session._id,
        sessionKey: session.key,
        passwordHash: session.passwordHash,
        scope: scope
      },
      Config.get('/jwtSecret'),
      { algorithm: 'HS256', expiresIn: expirationPeriod }
    )
  } else {
    const tokenUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      roleName: user.roleName,
      roleRank: user.roleRank,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _id: user._id
    }

    token = Jwt.sign(
      {
        user: tokenUser,
        scope: scope
      },
      Config.get('/jwtSecret'),
      { algorithm: 'HS256', expiresIn: expirationPeriod }
    )
  }

  return token
}

module.exports = createToken
