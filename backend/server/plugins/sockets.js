'use strict'

const nes = require('nes')

const Config = require('../../config/config')

const authStrategy = Config.get('/restHapiConfig/authStrategy')

module.exports = {
  plugin: {
    name: 'sockets',
    register
  }
}

async function register(server, options) {
  try {
    await server.register({
      plugin: nes,
      options: {
        auth: {
          type: 'direct',
          route: {
            strategy: authStrategy
          }
        },
        // auth: false,
        headers: ['*'],
        onConnection: function(socket) {
          // console.log("connection established", socket.auth)
          if (!socket.auth.isAuthenticated) {
            console.log('NO AUTH, DISCONNECTING')
            socket.disconnect()
          }
        },
        onDisconnection: function(socket) {
          console.log('connection closed')
        }
      }
    })
  } catch (err) {
    console.error('Failed to load plugin:', err)
  }
}
