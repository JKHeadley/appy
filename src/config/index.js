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

export const REQUIRED_PASSWORD_STRENGTH = 3

export const USER_ROLES = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin'
}

export const EVENTS = {
  GROUPS_UPDATED: 'groups-updated',
  PERMISSIONS_UPDATED: 'permissions-updated',
  PASSWORD_SCORE_UPDATED: 'password-score-updated',
  UPDATING_PASSWORD_SCORE: 'updating-password-score'
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
