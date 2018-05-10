/**
 * This file contains a list of permissions that only a Super Admin can assign.
 */

module.exports = [
  // EXPL: User permissions
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
  // EXPL: Role permissions
  'addRolePermissions',
  'addRoleUsers',
  'createRole',
  'deleteRole',
  'removeRolePermissions',
  'removeRoleUsers',
  'updateRole',
  // EXPL: Group permissions
  'deleteGroup',
  // EXPL: Permission permissions
  'addPermissionRoles',
  'createPermission',
  'deletePermission',
  'removePermissionRoles',
  'updatePermission',
  // EXPL: Connection permissions
  'deleteConnection',
  // EXPL: Conversation permissions
  'addConversationMessages',
  'addConversationUserData',
  'deleteConversation',
  'getConversationMessages',
  'getConversationUserData',
  'readConversation',
  'removeConversationMessages',
  'removeConversationUserData',
  'updateConversation',
  // EXPL: Message permissions
  'createMessage',
  'deleteMessage',
  'readMessage',
  'updateMessage',
  // EXPL: Notification permissions
  'createNotification',
  'deleteNotification',
  'readNotification',
  // EXPL: AuthAttempt permissions
  'associateAuthAttempt',
  'createAuthAttempt',
  'deleteAuthAttempt',
  'readAuthAttempt',
  'updateAuthAttempt',
  // EXPL: Session permissions
  'createSession',
  'deleteSession',
  'readSession',
  'updateSession',
  // EXPL: AuditLog permissions
  'deleteAuditLog',
  'updateAuditLog'
]
