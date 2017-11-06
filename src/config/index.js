export default {
  serverURI: 'http://localhost:8125',
  fixedLayout: false,
  hideLogoOnMobile: false
}

export const resources = {
  user: {
    alias: 'user',
    associations: {
      groups: {
        alias: 'group'
      },
      permissions: {
        alias: 'permission'
      }
    }
  },
  role: {
    alias: 'role',
    associations: {
      users: {
        alias: 'user'
      },
      permissions: {
        alias: 'permission'
      }
    }
  }
}

export const RESPONSE_MESSAGES = {
  EXPIRED_ACCESS_TOKEN: 'Expired Access Token',
  EXPIRED_REFRESH_TOKEN: 'Expired Refresh Token'
}
