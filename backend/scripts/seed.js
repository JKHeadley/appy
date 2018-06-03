'use strict'

process.env.NODE_ENV = 'local'

const path = require('path')
const Mongoose = require('mongoose')
const RestHapi = require('rest-hapi')
const faker = require('faker')
const iplocation = require('iplocation')
const Glue = require('glue')
const updatePermissions = require('../utilities/update-permissions.utility')
const dropCollections = require('../utilities/drop-collections.utility')
const Manifest = require('../config/manifest.conf')

const Config = require('../config')

const restHapiConfig = Config.get('/restHapiConfig')
const USER_ROLES = Config.get('/constants/USER_ROLES')
const PERMISSION_STATES = Config.get('/constants/PERMISSION_STATES')
;(async function seed() {
  RestHapi.config.loglevel = 'DEBUG'
  const Log = RestHapi.getLogger('seed')
  try {
    RestHapi.config = restHapiConfig
    RestHapi.config.absoluteModelPath = true
    RestHapi.config.modelPath = path.join(__dirname, '/../server/models')

    let models = await RestHapi.generateModels(Mongoose)

    const composeOptions = {
      relativeTo: path.join(__dirname, '/../')
    }

    const manifest = Manifest.get('/')
    const server = await Glue.compose(manifest, composeOptions)

    await server.start()

    faker.seed(4997)

    const password = 'root'
    const pin = '1234'

    let roles = []
    let users = []
    let groups = []
    let permissions = []
    let adminPermissions = []

    let permissionNames = []

    let request = {}
    let promises = []
    let injectOptions = {}

    await dropCollections(models)
    models = await updatePermissions(models)
    Log.log('seeding roles')
    roles = [
      {
        name: USER_ROLES.USER,
        rank: 2,
        description: 'A standard user account.'
      },
      {
        name: USER_ROLES.ADMIN,
        rank: 1,
        description: 'A user with advanced permissions.'
      },
      {
        name: USER_ROLES.SUPER_ADMIN,
        rank: 0,
        description: 'A user with full permissions.'
      }
    ]
    roles = await RestHapi.create(models.role, roles, Log)

    Log.log('seeding permissions')
    permissions = [
      {
        name: 'root',
        description: 'Access to all endpoints',
        assignScope: [USER_ROLES.SUPER_ADMIN]
      },
      {
        name: 'create',
        description: 'Access to all create endpoints',
        assignScope: [USER_ROLES.SUPER_ADMIN]
      },
      {
        name: 'read',
        description: 'Access to all read endpoints',
        assignScope: [USER_ROLES.SUPER_ADMIN]
      },
      {
        name: 'update',
        description: 'Access to all update endpoints',
        assignScope: [USER_ROLES.SUPER_ADMIN]
      },
      {
        name: 'delete',
        description: 'Access to all delete endpoints',
        assignScope: [USER_ROLES.SUPER_ADMIN]
      },
      {
        name: 'associate',
        description: 'Access to all association endpoints',
        assignScope: [USER_ROLES.SUPER_ADMIN]
      },
      {
        name: 'enableUser',
        description: "Can enable a user's account",
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'disableUser',
        description: "Can disable a user's account",
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'activateUser',
        description: "Can activate a user's account",
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'deactivateUser',
        description: "Can deactivateUser a user's account",
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'resetPasswordNoPin',
        description: 'Can allow a user to reset their password without a PIN',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'readUserScope',
        description: "Can read a user's scope",
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'readUserConnectionStats',
        description: "Can read a user's connection stats",
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'receiveChatMessages',
        description: 'Can receive chat messages in real time',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'markConversationAsRead',
        description: 'Can mark a conversation as read',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'markConversationAsUnread',
        description: 'Can mark a conversation as unread',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'readMyConversations',
        description: "Can read the current user's chat conversations",
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'postChatMessage',
        description: 'Can post a chat message to a conversation',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'uploadImage',
        description: 'Can upload an image to the cloud',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'uploadProfileImage',
        description: 'Can upload a profile image to the cloud',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'receiveNotifications',
        description: 'Can receive notifications in real time',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      },
      {
        name: 'readAvailableNotifications',
        description:
          'Can get the permissions available for the current user to assign',
        assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
      }
    ]
    permissions = await RestHapi.create(models.permission, permissions, Log)

    Log.log('seeding groups')
    groups = [
      {
        name: 'Read Only',
        description:
          'Group that excludes all permissions except for Admin level read permissions.'
      },
      {
        name: 'Editor',
        description: 'Group that forbids all creating.'
      },
      {
        name: 'Super User',
        description:
          'Group with full permissions except root. Role restrictions remain.'
      }
    ]
    groups = await RestHapi.create(models.group, groups, Log)

    Log.log('seeding users')
    users = [
      {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'test@user.com',
        title: faker.name.jobTitle(),
        // profileImageUrl: 'https://www.gravatar.com/avatar/' + Mongoose.Types.ObjectId().toString() + '?r=PG&d=robohash',
        profileImageUrl: faker.image.avatar(),
        password: password,
        pin: pin,
        role: roles[0]._id,
        isActive: true
      },
      {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'test@readonlyuser.com',
        title: faker.name.jobTitle(),
        // profileImageUrl: 'https://www.gravatar.com/avatar/' + Mongoose.Types.ObjectId().toString() + '?r=PG&d=robohash',
        profileImageUrl: faker.image.avatar(),
        password: password,
        pin: pin,
        role: roles[0]._id,
        isActive: true
      },
      {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'test@admin.com',
        title: faker.name.jobTitle(),
        // profileImageUrl: 'https://www.gravatar.com/avatar/' + Mongoose.Types.ObjectId().toString() + '?r=PG&d=robohash',
        profileImageUrl: faker.image.avatar(),
        password: password,
        pin: pin,
        role: roles[1]._id,
        isActive: true
      },
      {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'test@readonlyadmin.com',
        title: faker.name.jobTitle(),
        // profileImageUrl: 'https://www.gravatar.com/avatar/' + Mongoose.Types.ObjectId().toString() + '?r=PG&d=robohash',
        profileImageUrl: faker.image.avatar(),
        password: password,
        pin: pin,
        role: roles[1]._id,
        isActive: true
      },
      {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'test@editoradmin.com',
        title: faker.name.jobTitle(),
        // profileImageUrl: 'https://www.gravatar.com/avatar/' + Mongoose.Types.ObjectId().toString() + '?r=PG&d=robohash',
        profileImageUrl: faker.image.avatar(),
        password: password,
        pin: pin,
        role: roles[1]._id,
        isActive: true
      },
      {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'test@superuseradmin.com',
        title: faker.name.jobTitle(),
        // profileImageUrl: 'https://www.gravatar.com/avatar/' + Mongoose.Types.ObjectId().toString() + '?r=PG&d=robohash',
        profileImageUrl: faker.image.avatar(),
        password: password,
        pin: pin,
        role: roles[1]._id,
        isActive: true
      },
      {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'test@superadmin.com',
        title: faker.name.jobTitle(),
        // profileImageUrl: 'https://www.gravatar.com/avatar/' + Mongoose.Types.ObjectId().toString() + '?r=PG&d=robohash',
        profileImageUrl: faker.image.avatar(),
        password: password,
        pin: pin,
        role: roles[2]._id,
        isActive: true
      }
    ]

    request = {
      method: 'POST',
      url: '/user',
      params: {},
      query: {},
      payload: users,
      credentials: { scope: ['root', USER_ROLES.SUPER_ADMIN] },
      headers: { authorization: 'Bearer' }
    }

    injectOptions = RestHapi.testHelper.mockInjection(request)

    let result = await server.inject(injectOptions)
    users = result.result
    Log.log('seeding visitors')

    promises = []

    let addVisitor = function(visitor) {
      let rand = Math.random()

      let browser = 'Other'

      if (rand > 0 && rand <= 0.4) {
        browser = 'Chrome'
      } else if (rand > 0.4 && rand <= 0.7) {
        browser = 'Firefox'
      } else if (rand > 0.7 && rand <= 0.8) {
        browser = 'Safari'
      } else if (rand > 0.8 && rand <= 0.95) {
        browser = 'IE'
      }

      visitor.browser = browser

      return RestHapi.create(models.visitor, visitor, Log)
    }

    // Specify the iplocation hosts to prevent issues (Ex: docker cant ping "https://ipaip.co/" by default)
    let hosts = ['freegeoip.net', 'ipapi.co']

    for (let i = 0; i <= 367; i++) {
      promises.push(iplocation(faker.internet.ip(), hosts).then(addVisitor))
    }

    await Promise.all(promises)

    Log.log('setting associations')

    result = await RestHapi.list(models.permission, {}, Log)
    permissions = result.docs
    permissionNames = permissions.map(function(p) {
      return p.name
    })

    promises = []

    let userBasePermissionNames = [
      'readUser',
      'readVisitor',
      'createConnection',
      'readConnection',
      'updateConnection',
      'readUserConnectionStats',
      'receiveChatMessages',
      'markConversationAsRead',
      'markConversationAsUnread',
      'readMyConversations',
      'postChatMessage',
      'uploadImage',
      'uploadProfileImage',
      'receiveNotifications',
      'updateNotification'
    ]

    let userDocumentPermissions = permissions
      .filter(function(p) {
        // We start with permissions Admins can assign so that they can edit the user permissions
        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
      })
      .filter(function(p) {
        return p.name.includes('Document')
      })
      .map(function(p) {
        return {
          state: PERMISSION_STATES.INCLUDED,
          childId: p._id
        }
      })

    let userImagePermissions = permissions
      .filter(function(p) {
        // We start with permissions Admins can assign so that they can edit the user permissions
        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
      })
      .filter(function(p) {
        return p.name.includes('Image')
      })
      .map(function(p) {
        return {
          state: PERMISSION_STATES.INCLUDED,
          childId: p._id
        }
      })

    let userPermissions = userBasePermissionNames
      .map(function(permissionName) {
        return {
          state: PERMISSION_STATES.INCLUDED,
          childId: permissions.find(function(p) {
            return p.name === permissionName
          })._id
        }
      })
      .concat(userDocumentPermissions)
      .concat(userImagePermissions)

    // initial User role permissions
    promises.push(
      RestHapi.addMany(
        models.role,
        roles[0]._id,
        models.permission,
        'permissions',
        userPermissions,
        Log
      )
    )

    await Promise.all(promises)
    promises = []

    // Admins have access to any permission they can assign.
    adminPermissions = permissions
      .filter(function(p) {
        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
      })
      .map(function(p) {
        return {
          state: PERMISSION_STATES.INCLUDED,
          childId: p._id
        }
      })

    // Initial Admin role permissions
    promises.push(
      RestHapi.addMany(
        models.role,
        roles[1]._id,
        models.permission,
        'permissions',
        adminPermissions,
        Log
      )
    )

    await Promise.all(promises)
    promises = []

    // Initial Super Admin role permissions
    promises.push(
      RestHapi.addMany(
        models.role,
        roles[2]._id,
        models.permission,
        'permissions',
        [
          {
            state: PERMISSION_STATES.INCLUDED,
            childId: permissions.find(function(p) {
              return p.name === 'root'
            })._id
          }
        ],
        Log
      )
    )

    await Promise.all(promises)

    promises = []

    // Read Only group permissions
    let readOnlyExcludedPermissions = permissions
      .filter(function(p) {
        // We start with permissions Admins can assign so that they will also be able to assign the group
        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
      })
      .filter(function(p) {
        return !(p.name.includes('read') || p.name.includes('get'))
      })
      .map(function(p) {
        return {
          state: PERMISSION_STATES.EXCLUDED,
          childId: p._id
        }
      })

    promises.push(
      RestHapi.addMany(
        models.group,
        groups[0]._id,
        models.permission,
        'permissions',
        readOnlyExcludedPermissions,
        Log
      )
    )

    await Promise.all(promises)
    promises = []

    // Editor group permissions
    let createForbiddenPermission = permissions
      .filter(function(p) {
        // We start with permissions Admins can assign so that they will also be able to assign the group
        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
      })
      .filter(function(p) {
        return p.name.includes('create')
      })
      .map(function(p) {
        return {
          state: PERMISSION_STATES.FORBIDDEN,
          childId: p._id
        }
      })

    promises.push(
      RestHapi.addMany(
        models.group,
        groups[1]._id,
        models.permission,
        'permissions',
        createForbiddenPermission,
        Log
      )
    )

    await Promise.all(promises)
    promises = []

    // Super User group permissions
    let includedPermissions = permissionNames
      .filter(function(permissionName) {
        return permissionName !== 'root'
      })
      .map(function(permissionName) {
        return {
          state: PERMISSION_STATES.INCLUDED,
          childId: permissions.find(function(p) {
            return p.name === permissionName
          })._id
        }
      })

    promises.push(
      RestHapi.addMany(
        models.group,
        groups[2]._id,
        models.permission,
        'permissions',
        includedPermissions,
        Log
      )
    )

    await Promise.all(promises)
    promises = []

    // Assign groups to users
    promises.push(
      RestHapi.addMany(
        models.user,
        users[1]._id,
        models.group,
        'groups',
        [groups[0]._id],
        Log
      )
    )
    promises.push(
      RestHapi.addMany(
        models.user,
        users[3]._id,
        models.group,
        'groups',
        [groups[0]._id],
        Log
      )
    )
    promises.push(
      RestHapi.addMany(
        models.user,
        users[4]._id,
        models.group,
        'groups',
        [groups[1]._id],
        Log
      )
    )
    promises.push(
      RestHapi.addMany(
        models.user,
        users[5]._id,
        models.group,
        'groups',
        [groups[2]._id],
        Log
      )
    )

    await Promise.all(promises)

    process.exit(0)
  } catch (err) {
    Log.error(err)

    process.exit(1)
  }
})()
