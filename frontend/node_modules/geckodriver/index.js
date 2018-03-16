var os = require('os');
var fs = require('fs');
var path = require('path');
var url = require('url');

var got = require('got');
var tar = require('tar');
var AdmZip = require('adm-zip');

var Promise = require('bluebird');

var platform = os.platform();
var arch = os.arch();

var baseCDNURL = process.env.GECKODRIVER_CDNURL || process.env.npm_config_geckodriver_cdnurl || 'https://github.com/mozilla/geckodriver/releases/download';

// Remove trailing slash if included
baseCDNURL = baseCDNURL.replace(/\/+$/, '');

var DOWNLOAD_MAC = baseCDNURL + '/v0.19.1/geckodriver-v0.19.1-macos.tar.gz';
var DOWNLOAD_LINUX64 = baseCDNURL + '/v0.19.1/geckodriver-v0.19.1-linux64.tar.gz';
var DOWNLOAD_LINUX32 = baseCDNURL + '/v0.19.1/geckodriver-v0.19.1-linux32.tar.gz';
var DOWNLOAD_WIN32 = baseCDNURL + '/v0.19.1/geckodriver-v0.19.1-win32.zip';
var DOWNLOAD_WIN64 = baseCDNURL + '/v0.19.1/geckodriver-v0.19.1-win64.zip';

// TODO: move this to package.json or something
var downloadUrl = DOWNLOAD_MAC;
var outFile = 'geckodriver.tar.gz';
var executable = 'geckodriver';

if (platform === 'linux') {
  downloadUrl = arch === 'x64' ? DOWNLOAD_LINUX64 : DOWNLOAD_LINUX32;
}

if (platform === 'win32') {
  // No 32-bits of geckodriver for now
  downloadUrl = arch === 'x64' ? DOWNLOAD_WIN64 : DOWNLOAD_WIN32;
  outFile = 'geckodriver.zip';
  executable = 'geckodriver.exe';
}

process.stdout.write('Downloading geckodriver... ');
got.stream(url.parse(downloadUrl))
  .pipe(fs.createWriteStream(outFile))
  .on('close', function() {
    process.stdout.write('Extracting... ');
    extract(path.join(__dirname, outFile), __dirname)
      .then(function(){
        console.log('Complete.');
      })
      .catch(function(err){
        console.log('Something is wrong ', err.stack);
      });
  });

function extract(archivePath, targetDirectoryPath) {
  return new Promise(function(resolve, reject) {
    if (outFile.indexOf('.tar.gz') >= 0) {
      tar.extract({
        file: archivePath,
        cwd: targetDirectoryPath
      }).then(function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else if (outFile.indexOf('.zip') >= 0) {
      new AdmZip(archivePath).extractAllToAsync(targetDirectoryPath, true, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      reject('This archive extension is not supported: ' + archivePath);
    }
  });
}
