export default {
  // serverURI: 'http://localhost:8080',
  // websocketURI: 'ws://localhost:8080',
  // serverURI: 'http://192.168.86.42:8080',
  // websocketURI: 'ws://192.168.86.42:8080',
  // appURI: 'http://localhost:3000',
  // appURI: 'http://192.168.86.42:3000',
  serverURI: process.env.SERVER_URI,
  websocketURI: process.env.WEBSOCKET_URI,
  appURI: process.env.APP_URI,
  fixedLayout: false,
  hideLogoOnMobile: false
}

/**
 * Adding a property to this object will create a repository for that property.
 * Ex: user: { alias: 'user' } will create $visitorRepository accessible in each component's "this".
 * */
export const resources = {
  user: {
    alias: 'user',
    associations: {
      groups: {
        alias: 'group'
      },
      permissions: {
        alias: 'permission'
      },
      connections: {
        alias: 'connection'
      },
      conversations: {
        alias: 'conversation'
      },
      notifications: {
        alias: 'notification'
      },
      documents: {
        alias: 'document'
      },
      sharedDocuments: {
        alias: 'shared-document'
      },
      images: {
        alias: 'image'
      }
    }
  },
  conversation: {
    alias: 'conversation'
  },
  notification: {
    alias: 'notification'
  },
  connection: {
    alias: 'connection'
  },
  auditLog: {
    alias: 'auditLog',
    options: {
      filterDeleted: false
    }
  },
  document: {
    alias: 'document',
    associations: {
      users: {
        alias: 'user'
      }
    }
  },
  image: {
    alias: 'image'
  },
  visitor: {
    alias: 'visitor'
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
  USER: resources.user.alias || 'user',
  PERMISSION: resources.permission.alias || 'permission'
}

export const REQUIRED_PASSWORD_STRENGTH = 3

export const USER_ROLES = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin'
}

export const CHAT_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group'
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

export const NOTIFICATION_TYPES = {
  SHARED_DOCUMENT: 'shared-document',
  FOLLOW: 'follow',
  CONTACT: 'contact'
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
  PERMISSION_USERS_UPDATED: 'permission-users-updated',
  PERMISSION_USERS_SAVED: 'permission-users-saved',
  PERMISSION_GROUPS_UPDATED: 'permission-groups-updated',
  PERMISSION_GROUPS_SAVED: 'permission-groups-saved',
  PASSWORD_SCORE_UPDATED: 'password-score-updated',
  UPDATING_PASSWORD_SCORE: 'updating-password-score',

  DATA_REQUESTED: 'data-requested',
  DATA_READY: 'data-ready',
  CLEAR_REQUESTED: 'clear-requested',

  OPEN_CHAT: 'open-chat',
  CLOSE_CHAT: 'close-chat',
  OPEN_CHAT_CREATE: 'open-chat-create',
  CLOSE_CHAT_CREATE: 'close-chat-create',

  MARK_CONVERSATION_AS_READ: 'mark-conversation-as-read',
  MARK_CONVERSATION_AS_UNREAD: 'mark-conversation-as-unread',

  MARK_NOTIFICATION_AS_READ: 'mark-notification-as-read',
  MARK_NOTIFICATION_AS_UNREAD: 'mark-notification-as-unread'
}
