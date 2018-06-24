/**
 * This file contains a list of permissions that only a Super Admin can assign.
 */

module.exports = [
  // User permissions
  'addUserConnections',
  'addUserConversations',
  'addUserDocuments',
  'addUserImages',
  'addUserNotifications',
  'addUserSharedDocuments',
  'createUser',
  'deleteUser',
  'getUserConversations',
  'getUserDocuments',
  'getUserNotifications',
  'getUserSharedDocuments',
  'removeUserConnections',
  'removeUserConversations',
  'removeUserDocuments',
  'removeUserImages',
  'removeUserNotifications',
  'removeUserSharedDocuments',
  // Role permissions
  'addRolePermissions',
  'addRoleUsers',
  'createRole',
  'deleteRole',
  'removeRolePermissions',
  'removeRoleUsers',
  'updateRole',
  // Group permissions
  'deleteGroup',
  // Permission permissions
  'addPermissionRoles',
  'createPermission',
  'deletePermission',
  'removePermissionRoles',
  'updatePermission',
  // Connection permissions
  'deleteConnection',
  // Conversation permissions
  'addConversationMessages',
  'addConversationUserData',
  'deleteConversation',
  'getConversationMessages',
  'getConversationUserData',
  'readConversation',
  'removeConversationMessages',
  'removeConversationUserData',
  'updateConversation',
  // Message permissions
  'createMessage',
  'deleteMessage',
  'readMessage',
  'updateMessage',
  // Notification permissions
  'createNotification',
  'deleteNotification',
  'readNotification',
  // AuthAttempt permissions
  'associateAuthAttempt',
  'createAuthAttempt',
  'deleteAuthAttempt',
  'readAuthAttempt',
  'updateAuthAttempt',
  // Session permissions
  'createSession',
  'deleteSession',
  'readSession',
  'updateSession',
  // AuditLog permissions
  'deleteAuditLog',
  'updateAuditLog'
]
