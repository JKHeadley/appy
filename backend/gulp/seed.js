'use strict'

const gulp = require('gulp')
const exit = require('gulp-exit')
const Q = require('q')
const Mongoose = require('mongoose')
const RestHapi = require('rest-hapi')
const faker = require('faker')
const iplocation = require('iplocation');
const Composer = require('../index')

const Config = require('../config')

const restHapiConfig = Config.get('/restHapiConfig')
const USER_ROLES = Config.get('/constants/USER_ROLES')
const PERMISSION_STATES = Config.get('/constants/PERMISSION_STATES')

const superAdminAssignScope = require('./superAdminAssignScope')

let models = null

gulp.task('seed', [], function () {

  RestHapi.config = restHapiConfig
  RestHapi.config.absoluteModelPath = true
  RestHapi.config.modelPath = __dirname + '/../server/models'

  return RestHapi.generateModels(Mongoose)
    .then(function (result) {
      models = result

      return Composer((err, server) => {

        if (err) {
          throw err
        }

        return server.start((err) => {
          RestHapi.config.loglevel = 'DEBUG'
          const Log = RestHapi.getLogger('seed')

          faker.seed(4997)

          const password = 'root'
          const pin = '1234'

          let roles = []
          let users = []
          let groups = []
          let visitors = []
          let permissions = []
          let adminPermissions = []

          let permissionNames = []

          let request = {}
          let promises = []
          let injectOptions = {}

          return dropCollections(models)
            .then(function (result) {
              return updatePermissions()
            })
            .then(function (result) {
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
              return RestHapi.create(models.role, roles, Log)
            })
            .then(function (result) {
              roles = result
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
                  description: 'Can enable a user\'s account',
                  assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
                },
                {
                  name: 'disableUser',
                  description: 'Can disable a user\'s account',
                  assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
                },
                {
                  name: 'activateUser',
                  description: 'Can activate a user\'s account',
                  assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
                },
                {
                  name: 'deactivateUser',
                  description: 'Can deactivateUser a user\'s account',
                  assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
                },
                {
                  name: 'resetPasswordNoPin',
                  description: 'Can allow a user to reset their password without a PIN',
                  assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
                },
                {
                  name: 'readUserScope',
                  description: 'Can read a user\'s scope',
                  assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
                },
                {
                  name: 'readUserConnectionStats',
                  description: 'Can read a user\'s connection stats',
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
                  description: 'Can read the current user\'s chat conversations',
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
                  description: 'Can get the permissions available for the current user to assign',
                  assignScope: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
                }
              ]
              return RestHapi.create(models.permission, permissions, Log)
            })
            .then(function (result) {
              permissions = result
              Log.log('seeding groups')
              groups = [
                {
                  name: 'Read Only',
                  description: 'Group that excludes all permissions except for Admin level read permissions.'
                },
                {
                  name: 'Editor',
                  description: 'Group that forbids all creating.'
                },
                {
                  name: 'Super User',
                  description: 'Group with full permissions except root. Role restrictions remain.'
                }
              ]
              return RestHapi.create(models.group, groups, Log)
            })
            .then(function (result) {
              groups = result
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
                credentials: {scope: ['root', USER_ROLES.SUPER_ADMIN]},
                headers: {authorization: 'Bearer'}
              }

              injectOptions = RestHapi.testHelper.mockInjection(request)

              return server.inject(injectOptions)
            })
            .then(function (result) {
              users = result.result
              Log.log('seeding visitors')

              promises = [];

              let addVisitor = function(visitor) {

                let rand = Math.random();

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

                visitor.browser = browser;

                return RestHapi.create(models.visitor, visitor, Log);
              }

              for (let i = 0; i <= 367; i++) {
                promises.push(iplocation(faker.internet.ip()).then(addVisitor))
              }

              return Q.all(promises)
            })
            .then(function (result) {
              Log.log('setting associations')

              return RestHapi.list(models.permission, {}, Log)
                .then(function (result) {
                  permissions = result.docs
                  permissionNames = permissions.map(function(p) { return p.name })

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
                    'updateNotification',
                  ];


                  let userDocumentPermissions = permissions.filter(function(p) {
                    //EXPL: We start with permissions Admins can assign so that they can edit the user permissions
                    return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
                  }).filter(function(p) {
                    return p.name.includes('Document')
                  }).map(function(p) {
                    return {
                      state: PERMISSION_STATES.INCLUDED,
                      childId: p._id
                    }
                  })

                  let userImagePermissions = permissions.filter(function(p) {
                    //EXPL: We start with permissions Admins can assign so that they can edit the user permissions
                    return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
                  }).filter(function(p) {
                    return p.name.includes('Image')
                  }).map(function(p) {
                    return {
                      state: PERMISSION_STATES.INCLUDED,
                      childId: p._id
                    }
                  })

                  let userPermissions = userBasePermissionNames.map(function(permissionName) {
                    return {
                      state: PERMISSION_STATES.INCLUDED,
                      childId: permissions.find(function (p) {
                        return p.name === permissionName
                      })._id
                    }
                  }).concat(userDocumentPermissions).concat(userImagePermissions)


                  // EXPL: initial User role permissions
                  promises.push(RestHapi.addMany(models.role, roles[0]._id, models.permission, 'permissions', userPermissions, Log))

                  return Q.all(promises)
                    .then(function (result) {
                      promises = []

                      // EXPL: Admins have access to any permission they can assign.
                      adminPermissions = permissions.filter(function(p) {
                        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
                      }).map(function(p) {
                        return {
                          state: PERMISSION_STATES.INCLUDED,
                          childId: p._id
                        }
                      })

                      // EXPL: Initial Admin role permissions
                      promises.push(RestHapi.addMany(models.role, roles[1]._id, models.permission, 'permissions', adminPermissions, Log))

                      return Q.all(promises)
                    })
                    .then(function (result) {
                      promises = []

                      // EXPL: Initial Super Admin role permissions
                      promises.push(RestHapi.addMany(models.role, roles[2]._id, models.permission, 'permissions', [
                        {
                          state: PERMISSION_STATES.INCLUDED,
                          childId: permissions.find(function (p) {
                            return p.name === 'root'
                          })._id
                        },
                      ], Log))

                      return Q.all(promises)
                    })
                    .then(function (result) {
                      promises = []

                      //EXPL: Read Only group permissions
                      let readOnlyExcludedPermissions = permissions.filter(function(p) {
                        //EXPL: We start with permissions Admins can assign so that they will also be able to assign the group
                        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
                      }).filter(function(p) {
                        return !(p.name.includes('read') || p.name.includes ('get'))
                      }).map(function(p) {
                        return {
                          state: PERMISSION_STATES.EXCLUDED,
                          childId: p._id
                        }
                      })

                      promises.push(RestHapi.addMany(models.group, groups[0]._id, models.permission, 'permissions', readOnlyExcludedPermissions, Log))

                      return Q.all(promises)
                    })
                    .then(function (result) {
                      promises = []

                      //EXPL: Editor group permissions
                      let createForbiddenPermission = permissions.filter(function(p) {
                        //EXPL: We start with permissions Admins can assign so that they will also be able to assign the group
                        return p.assignScope.indexOf(USER_ROLES.ADMIN) > -1
                      }).filter(function(p) {
                        return p.name.includes('create')
                      }).map(function(p) {
                        return {
                          state: PERMISSION_STATES.FORBIDDEN,
                          childId: p._id
                        }
                      })

                      promises.push(RestHapi.addMany(models.group, groups[1]._id, models.permission, 'permissions', createForbiddenPermission, Log))

                      return Q.all(promises)
                    })
                    .then(function (result) {
                      promises = []

                      //EXPL: Super User group permissions
                      let includedPermissions = permissionNames.filter(function(permissionName) {
                        return permissionName !== 'root'
                      }).map(function(permissionName) {
                        return {
                          state: PERMISSION_STATES.INCLUDED,
                          childId: permissions.find(function (p) {
                            return p.name === permissionName
                          })._id
                        }
                      })

                      promises.push(RestHapi.addMany(models.group, groups[2]._id, models.permission, 'permissions', includedPermissions, Log))

                      return Q.all(promises)
                    })
                    .then(function (result) {
                      promises = []

                      //EXPL: Assign groups to users
                      promises.push(RestHapi.addMany(models.user, users[1]._id, models.group, 'groups', [groups[0]._id], Log))
                      promises.push(RestHapi.addMany(models.user, users[3]._id, models.group, 'groups', [groups[0]._id], Log))
                      promises.push(RestHapi.addMany(models.user, users[4]._id, models.group, 'groups', [groups[1]._id], Log))
                      promises.push(RestHapi.addMany(models.user, users[5]._id, models.group, 'groups', [groups[2]._id], Log))

                      return Q.all(promises)
                    })
                })
            })
            .then(function (result) {
              return gulp.src('')
                .pipe(exit())
            })
            .catch(function (error) {
              Log.error(error)
            })
        })
      })
    })
})

gulp.task('update-permissions', [], function () {
  RestHapi.config.loglevel = 'DEBUG'
  const Log = RestHapi.getLogger('update-permissions')

  return updatePermissions()
    .then(function (result) {

      return gulp.src('')
        .pipe(exit())
    })
    .catch(function (error) {
      Log.error(error)
    })
})

/**
 * A function that generates permissions relevant to each model.
 * NOTE: If some permissions already exist, you might receive a "duplicate key" error, however all generated
 * permissions that don't already exist should still be successfully added.
 * @returns {Promise|Promise.<TResult>|*}
 */
function updatePermissions () {
  RestHapi.config.loglevel = 'DEBUG'
  const Log = RestHapi.getLogger('update-permissions')

  let promise = {}

  if (models) {
    promise = Q.when(models)
  }
  else {
    Mongoose.Promise = Q.Promise

    RestHapi.config = restHapiConfig
    RestHapi.config.absoluteModelPath = true
    RestHapi.config.modelPath = __dirname + '/../server/models'

    Mongoose.connect(restHapiConfig.mongo.URI)

    promise = RestHapi.generateModels(Mongoose)
  }
  return promise
    .then(function (result) {
      models = result

      let promises = []

      for (const modelKey in models) {
        const model = models[modelKey]
        const modelName = model.collectionName[0].toUpperCase() + model.collectionName.slice(1)
        const permissions = []
        let name = '';
        let assignScope;

        permissions.push({
          name: model.collectionName,
          description: 'Full access to ' + model.collectionName + ' endpoints',
          assignScope: [USER_ROLES.SUPER_ADMIN]
        })
        permissions.push({
          name: 'associate' + modelName,
          description: 'Can access all association endpoints for a ' + model.collectionName,
          assignScope: [USER_ROLES.SUPER_ADMIN]
        })
        permissions.push({
          name: 'add' + modelName + 'Associations',
          description: 'Can add all associations for a ' + model.collectionName,
          assignScope: [USER_ROLES.SUPER_ADMIN]
        })
        permissions.push({
          name: 'remove' + modelName + 'Associations',
          description: 'Can remove all associations for a ' + model.collectionName,
          assignScope: [USER_ROLES.SUPER_ADMIN]
        })
        permissions.push({
          name: 'get' + modelName + 'Associations',
          description: 'Can get all associations for a ' + model.collectionName,
          assignScope: [USER_ROLES.SUPER_ADMIN]
        })

        name = 'create' + modelName;
        assignScope = superAdminAssignScope.indexOf(name) > -1 ? [USER_ROLES.SUPER_ADMIN] : undefined
        permissions.push({name: name, description: 'Can create a ' + model.collectionName, assignScope})

        name = 'read' + modelName;
        assignScope = superAdminAssignScope.indexOf(name) > -1 ? [USER_ROLES.SUPER_ADMIN] : undefined
        permissions.push({name: 'read' + modelName, description: 'Can read a ' + model.collectionName, assignScope})

        name = 'update' + modelName;
        assignScope = superAdminAssignScope.indexOf(name) > -1 ? [USER_ROLES.SUPER_ADMIN] : undefined
        permissions.push({name: 'update' + modelName, description: 'Can update a ' + model.collectionName, assignScope})

        name = 'delete' + modelName;
        assignScope = superAdminAssignScope.indexOf(name) > -1 ? [USER_ROLES.SUPER_ADMIN] : undefined
        permissions.push({name: 'delete' + modelName, description: 'Can delete a ' + model.collectionName, assignScope})

        const associations = model.routeOptions.associations

        for (const key in associations) {

          if (associations[key].type === 'MANY_MANY' || associations[key].type === 'ONE_MANY') {
            const associationName = key[0].toUpperCase() + key.slice(1)

            name = 'add' + modelName + associationName;
            assignScope = superAdminAssignScope.indexOf(name) > -1 ? [USER_ROLES.SUPER_ADMIN] : undefined
            permissions.push({
              name: 'add' + modelName + associationName,
              description: 'Can add ' + key + ' to a ' + model.collectionName,
              assignScope
            })

            name = 'remove' + modelName + associationName;
            assignScope = superAdminAssignScope.indexOf(name) > -1 ? [USER_ROLES.SUPER_ADMIN] : undefined
            permissions.push({
              name: 'remove' + modelName + associationName,
              description: 'Can remove ' + key + ' from a ' + model.collectionName,
              assignScope
            })

            name = 'get' + modelName + associationName;
            assignScope = superAdminAssignScope.indexOf(name) > -1 ? [USER_ROLES.SUPER_ADMIN] : undefined
            permissions.push({
              name: 'get' + modelName + associationName,
              description: 'Can get a ' + model.collectionName + '\'s ' + key,
              assignScope
            })
          }

        }

        promises.push(RestHapi.create(models.permission, permissions, Log))

      }

      return Q.allSettled(promises)
        .then(function (result) {
          Log.log('Permissions Updated')
        })
        .catch(function (error) {
          Log.error(error)
        })
    })
}

/**
 * Drops all of the base collections before seeding.
 * @param models
 * @returns {Promise.<TResult>|Promise}
 */
function dropCollections (models) {
  const mongoose = require('mongoose')
  RestHapi.config.loglevel = 'LOG'
  const Log = RestHapi.getLogger('unseed')

  Log.log('removing users')
  return models.user.remove({})
    .then(function () {
      Log.log('removing roles')
      return models.role.remove({})
    })
    .then(function () {
      Log.log('removing groups')
      return models.group.remove({})
    })
    .then(function () {
      Log.log('removing permissions')
      return models.permission.remove({})
    })
    .then(function () {
      Log.log('removing sessions')
      return models.session.remove({})
    })
    .then(function () {
      Log.log('removing authAttempts')
      return models.authAttempt.remove({})
    })
    .then(function () {
      Log.log('removing connections')
      return models.connection.remove({})
    })
    .then(function () {
      Log.log('removing documents')
      return models.document.remove({})
    })
    .then(function () {
      Log.log('removing images')
      return models.image.remove({})
    })
    .then(function () {
      Log.log('removing visitors')
      return models.visitor.remove({})
    })
    .then(function () {
      Log.log('removing group_permission')
      return mongoose.model('group_permission').remove({})
    })
    .then(function () {
      Log.log('removing group_user')
      return mongoose.model('group_user').remove({})
    })
    .then(function () {
      Log.log('removing role_permission')
      return mongoose.model('role_permission').remove({})
    })
    .then(function () {
      Log.log('removing user_permission')
      return mongoose.model('user_permission').remove({})
    })
    .then(function () {
      Log.log('removing user_conversation')
      return mongoose.model('user_conversation').remove({})
    })
    .then(function () {
      Log.log('removing user_document')
      return mongoose.model('user_document').remove({})
    })
    .catch(function (error) {
      Log.error(error)
    })
}
