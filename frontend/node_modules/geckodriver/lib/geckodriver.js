var path = require('path');

// add the geckodriver path to process PATH
process.env.PATH += path.delimiter + path.join(__dirname, '..');

// support win32 vs other platforms
exports.path = process.platform === 'win32' ? path.join(__dirname, '..', 'geckodriver.exe') : path.join(__dirname, '..', 'geckodriver');

// specify the version of geckodriver
exports.version = '0.19.0';

exports.start = function(args) {
  exports.defaultInstance = require('child_process').execFile(exports.path, args);
  return exports.defaultInstance;
}

exports.stop = function () {
  if (exports.defaultInstance !== null){
    exports.defaultInstance.kill();
  }
}
