'use strict'

const Jwt = require('jsonwebtoken')
const Config = require('../../config')
const errorHelper = require('./error-helper')

function createToken(user, session, scope, expirationPeriod, logger) {
  const Log = logger.bind('token')
  try {
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
  } catch (err) {
    errorHelper.handleError(err, Log)
  }
}

module.exports = createToken
