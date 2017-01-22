'use strict';

const Confidence = require('confidence');
const Dotenv = require('dotenv');

Dotenv.config({ silent: true });

const criteria = {
  env: process.env.NODE_ENV
};


const config = {
  $meta: 'This file configures the Appy API.',
  projectName: 'Appy API',
  websiteName: 'Appy Admin',
  constants: {
    USER_ROLES: {
      ADMIN: 'Admin'
    }
  },
  authAttempts: {
    forIp: 50,
    forIpAndUser: 7
  },
  lockOutPeriod: 30, //in units of minutes
  cookieSecret: {
    $filter: 'env',
    production: process.env.COOKIE_SECRET,
    $default: '!k3yb04rdK4tz~4qu4~k3yb04rdd0gz!'
  },
  jwtSecret: {
    $filter: 'env',
    production: process.env.JWT_SECRET,
    $default: 'aStrongJwtSecret-#mgtfYK@QuRV8VMM7T>WfN4;^fMVr)y'
  },
  nodemailer: {
    $filter: 'env',
    local: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'appyhapi@gmail.com',
        pass: process.env.SMTP_PASSWORD
      }
    },
    production: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'appyhapi@gmail.com',
        pass: process.env.SMTP_PASSWORD
      }
    }
  },
  /**
   * defaultEmail:
   * If set to null, outgoing emails are sent to their actual address,
   * otherwise outgoing emails are sent to the defaultEmail
   */
  defaultEmail: {
    $filter: 'env',
    local: 'appyhapi@gmail.com',
    development: 'appyhapi@gmail.com',
    production: 'appyhapi@gmail.com'
  },
  system: {
    fromAddress: {
      name: 'appy',
      address: 'appyhapi@gmail.com'
    },
    toAddress: {
      name: 'appy',
      address: 'appyhapi@gmail.com'
    }
  },
  clientURL: {
    $filter: 'env',
    local: 'http://localhost:8125',
    production: 'http://localhost:8125',
    $default: 'http://localhost:8125'
  },
  restHapiConfig: {
    server: {
      port: {
        $filter: 'env',
        production: process.env.PORT,
        $default: 8125
      }
    },
    mongo: {
      URI: {
        $filter: 'env',
        local: 'mongodb://localhost/appy',
        $default: 'mongodb://localhost/appy'
      }
    },
    absoluteModelPath: true,
    modelPath: __dirname + '/api/models',
    auth: {
      $filter: 'env',
      local: 'jwt',
      $default: 'jwt'
    },
    enableQueryValidation: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enablePayloadValidation: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enableResponseValidation: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enableTextSearch: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enableSoftDelete: {
      $filter: 'env',
      local: true,
      $default: true
    },
    filterDeletedEmbeds: {
      $filter: 'env',
      local: false,
      $default: false
    },
    loglevel: {
      $filter: 'env',
      local: "DEBUG",
      $default: "ERROR"
    }

  }
};


const store = new Confidence.Store(config);


exports.get = function (key) {

  return store.get(key, criteria);
};


exports.meta = function (key) {

  return store.meta(key, criteria);
};
