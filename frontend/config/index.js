// var fs = require('fs')

let prodEnv, devEnv

// We don't commit env vars, so these lines are required for CI deployments

// fs.stat('./frontend/config/prod.env', function (err, stat) {
//   if (err == null) {
//     console.log("NO PROD")
//     // file exists
//     prodEnv = require('./prod.env')
//   } else {
//     prodEnv = process.env
//   }
// })
//
// fs.stat('./frontend/config/dev.env', function (err, stat) {
//   if (err == null) {
//     console.log("NO DEV")
//     // file exists
//     devEnv = require('./dev.env')
//   } else {
//     devEnv = process.env
//   }
// })

// We don't commit env vars, so these lines are required for CI deployments
try {
  prodEnv = require('./prod.env')
} catch (error) {
  prodEnv = process.env
}

try {
  devEnv = require('./dev.env')
} catch (error) {
  devEnv = process.env
}

// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    env: prodEnv,
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: devEnv,
    port: 3000,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
