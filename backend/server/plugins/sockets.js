'use strict'

const nes = require('nes')

const Config = require('../config/config')

const authStrategy = Config.get('/restHapiConfig/authStrategy')

exports.register = function(server, options, next) {
  server.register(
    {
      register: nes,
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
    },
    function(err) {
      if (err) {
        console.error('Failed to load plugin:', err)
      }

      // server.subscription('/conversation/{_id}', {
      //   filter: function (path, message, options, next) {
      //     console.debug("PUBLISHED PATH:", path)
      //     console.debug("PUBLISHED MESSAGE:", message)
      //     console.debug("PUBLISHED PARAMS:", options.params)
      //     next(true);
      //   },
      //   auth: false,
      //   onSubscribe: function (socket, path, params, next) {
      //     console.debug("SUBSCRIPTION PATH:", path)
      //     console.debug("SUBSCRIPTION PARAMS:", params)
      //     next();
      //   }
      // });

      console.log('WEBSOCKETS REGISTERED')

      next()
    }
  )
}

exports.register.attributes = {
  name: 'sockets'
}
