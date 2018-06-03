'use strict'

const Confidence = require('confidence')
const Dotenv = require('dotenv')
const path = require('path')

Dotenv.config({ silent: true })

/**
 * NOTE: Only secrets and values affected by the environment (not NODE_ENV) are stored in .env files. All other values
 * are defined here.
 */

// The criteria to filter config values by (NODE_ENV). Typically includes:
//  - local
//  - development
//  - production
//  - $default
const criteria = {
  env: process.env.NODE_ENV
}

// These values stay the same regardless of the environment.
const constants = {
  USER_ROLES: {
    USER: 'User',
    ADMIN: 'Admin',
    SUPER_ADMIN: 'Super Admin'
  },
  PERMISSION_STATES: {
    INCLUDED: 'Included',
    EXCLUDED: 'Excluded',
    FORBIDDEN: 'Forbidden'
  },
  CHAT_TYPES: {
    DIRECT: 'direct',
    GROUP: 'group'
  },
  NOTIFICATION_TYPES: {
    SHARED_DOCUMENT: 'shared-document',
    FOLLOW: 'follow',
    CONTACT: 'contact'
  },
  AUTH_STRATEGIES: {
    TOKEN: 'standard-jwt',
    SESSION: 'jwt-with-session',
    REFRESH: 'jwt-with-session-and-refresh-token'
  },
  REQUIRED_PASSWORD_STRENGTH: {
    USER: 3,
    ADMIN: 4,
    SUPER_ADMIN: 4
  },
  EXPIRATION_PERIOD: {
    SHORT: '10m',
    MEDIUM: '4h',
    LONG: '730h'
  },
  AUTH_ATTEMPTS: {
    FOR_IP: 50,
    FOR_IP_AND_USER: 5
  },
  LOCKOUT_PERIOD: 30, // in units of minutes
  API_TITLE: 'appy API',
  WEB_TITLE: 'appy Admin'
}

const config = {
  $meta: 'This file configures the appy API.',
  constants: constants,
  projectName: constants.API_TITLE,
  port: {
    $filter: 'env',
    production: 8125,
    $default: 8125
  },
  S3BucketName: {
    $filter: 'env',
    production: 'appy-cdn',
    $default: 'appy-cdn'
  },
  jwtSecret: {
    $filter: 'env',
    production: process.env.JWT_SECRET,
    $default: process.env.JWT_SECRET
  },
  socialPassword: {
    $filter: 'env',
    production: process.env.SOCIAL_PASSWORD,
    $default: process.env.SOCIAL_PASSWORD
  },
  socialIds: {
    $filter: 'env',
    production: {
      facebook: process.env.FACEBOOK_ID,
      google: process.env.GOOGLE_ID,
      github: process.env.GITHUB_ID
    },
    $default: {
      facebook: process.env.FACEBOOK_ID,
      google: process.env.GOOGLE_ID,
      github: process.env.GITHUB_ID
    }
  },
  socialSecrets: {
    $filter: 'env',
    production: {
      facebook: process.env.FACEBOOK_SECRET,
      google: process.env.GOOGLE_SECRET,
      github: process.env.GITHUB_SECRET
    },
    $default: {
      facebook: process.env.FACEBOOK_SECRET,
      google: process.env.GOOGLE_SECRET,
      github: process.env.GITHUB_SECRET
    }
  },
  // Enable TLS for social login
  socialSecure: {
    $filter: 'env',
    production: true,
    $default: false
  },
  nodemailer: {
    $filter: 'env',
    production: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'appyhapi@gmail.com',
        pass: process.env.SMTP_PASSWORD
      }
    },
    $default: {
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
    production: null,
    $default: 'appyhapi@gmail.com'
  },
  system: {
    $filter: 'env',
    production: {
      fromAddress: {
        name: 'appy',
        address: 'appyhapi@gmail.com'
      },
      toAddress: {
        name: 'appy',
        address: 'appyhapi@gmail.com'
      }
    },
    $default: {
      fromAddress: {
        name: 'appy',
        address: 'appyhapi@gmail.com'
      },
      toAddress: {
        name: 'appy',
        address: 'appyhapi@gmail.com'
      }
    }
  },
  clientURL: {
    $filter: 'env',
    production: process.env.CLIENT_URI,
    $default: process.env.CLIENT_URI
  },
  // If true, the 'demoAuth' policy is used to restrict certain actions.
  enableDemoAuth: {
    $filter: 'env',
    production: true,
    $default: true
  },
  // This is the config object passed into the rest-hapi plugin during registration:
  // https://github.com/JKHeadley/rest-hapi#configuration
  restHapiConfig: {
    appTitle: constants.API_TITLE,
    mongo: {
      URI: {
        $filter: 'env',
        production: process.env.MONGODB_URI,
        $default: process.env.MONGODB_URI
      }
    },
    cors: {
      additionalHeaders: ['X-Access-Token', 'X-Refresh-Token'],
      additionalExposedHeaders: ['X-Access-Token', 'X-Refresh-Token']
    },
    absoluteModelPath: true,
    modelPath: path.join(__dirname, '/../server/models'),
    absoluteApiPath: true,
    apiPath: path.join(__dirname, '/../server/api'),
    absolutePolicyPath: true,
    policyPath: path.join(__dirname, '/../server/policies'),
    authStrategy: {
      $filter: 'env',
      production: constants.AUTH_STRATEGIES.REFRESH,
      $default: constants.AUTH_STRATEGIES.REFRESH
    },
    enableWhereQueries: {
      $filter: 'env',
      production: false,
      $default: false
    },
    enableQueryValidation: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enablePayloadValidation: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enableResponseValidation: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enableTextSearch: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enableSoftDelete: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enablePolicies: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enableDuplicateFields: {
      $filter: 'env',
      production: true,
      $default: true
    },
    trackDuplicatedFields: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enableDocumentScopes: {
      $filter: 'env',
      production: true,
      $default: true
    },
    enableSwaggerHttps: {
      $filter: 'env',
      production: true,
      $default: false
    },
    generateScopes: {
      $filter: 'env',
      production: true,
      $default: true
    },
    logRoutes: {
      $filter: 'env',
      production: false,
      $default: true
    },
    logScopes: {
      $filter: 'env',
      production: false,
      $default: false
    },
    loglevel: {
      $filter: 'env',
      production: 'ERROR',
      $default: 'DEBUG'
    }
  }
}

const store = new Confidence.Store(config)

exports.get = function(key) {
  return store.get(key, criteria)
}

exports.meta = function(key) {
  return store.meta(key, criteria)
}
