export default {
  serverURI: 'http://localhost:8125',
  appURI: 'http://localhost:8080',
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
  USER_PERMISSIONS_UPDATED: 'user-permissions-updated',
  USER_PERMISSIONS_SAVED: 'user-permissions-saved',
  USER_GROUPS_UPDATED: 'user-groups-updated',
  USER_GROUPS_SAVED: 'user-groups-saved',
  GROUP_USERS_UPDATED: 'group-users-updated',
  GROUP_USERS_SAVED: 'group-users-saved',
  GROUP_PERMISSIONS_UPDATED: 'group-permissions-updated',
  GROUP_PERMISSIONS_SAVED: 'group-permissions-saved',
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
