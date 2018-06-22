var merge = require('webpack-merge')
var devEnv = require('./dev.env')

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  SERVER_URI: '"http://localhost:8080"',
  WEBSOCKET_URI: '"ws://localhost:8080"',
  APP_URI: '"http://localhost:3000"'
})
