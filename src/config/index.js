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
  },
  group: {
    alias: 'group',
    associations: {
      users: {
        alias: 'user'
      },
      permissions: {
        alias: 'permission'
      }
    }
  },
  permission: {
    alias: 'permission',
    associations: {
      users: {
        alias: 'user'
      },
      roles: {
        alias: 'role'
      },
      groups: {
        alias: 'group'
      }
    }
  }
}

export const API = {
  USER: resources.user.alias || 'user'
}

export const EVENTS = {
  USER_UPDATED: 'user-updated'
}

export const PERMISSION_STATES = {
  INCLUDED: 'Included',
  EXCLUDED: 'Excluded',
  FORBIDDEN: 'Forbidden'
}

export const RESPONSE_MESSAGES = {
  EXPIRED_ACCESS_TOKEN: 'Expired Access Token',
  EXPIRED_REFRESH_TOKEN: 'Expired Refresh Token'
}
