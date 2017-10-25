'use strict';

const gulp = require('gulp');
const exit = require('gulp-exit');
const Q = require('q');
const Mongoose = require('mongoose');
const RestHapi = require('rest-hapi');

const Config = require('../config');

const restHapiConfig = Config.get('/restHapiConfig');
const USER_ROLES = Config.get('/constants/USER_ROLES');
const PERMISSION_STATES = Config.get('/constants/PERMISSION_STATES');

let models = null;

gulp.task('seed', [], function () {

  Mongoose.Promise = Q.Promise;

  RestHapi.config = restHapiConfig;
  RestHapi.config.absoluteModelPath = true;
  RestHapi.config.modelPath = __dirname + "/../server/models";

  Mongoose.connect(restHapiConfig.mongo.URI);

  return RestHapi.generateModels(Mongoose)
    .then(function (result) {
      models = result;

      RestHapi.config.loglevel = "DEBUG";
      const Log = RestHapi.getLogger("seed");

      const password = "root";

      let roles = [];
      let users = [];
      let groups = [];
      let permissions = [];

      let promises = [];

      return dropCollections(models)
        .then(function (result) {
          return updatePermissions();
        })
        .then(function (result) {
          Log.log("seeding roles");
          roles = [
            {
              name: USER_ROLES.USER,
              description: "A standard user account."
            },
            {
              name: USER_ROLES.ADMIN,
              description: "A user with advanced permissions."
            },
            {
              name: USER_ROLES.SUPER_ADMIN,
              description: "A user with full permissions."
            }
          ];
          return RestHapi.create(models.role, roles, Log);
        })
        .then(function (result) {
          roles = result;
          Log.log("seeding permissions");
          permissions = [
            {
              name: "root",
              description: "Access to all endpoints"
            },
            {
              name: "create",
              description: "Access to all create endpoints"
            },
            {
              name: "read",
              description: "Access to all read endpoints"
            },
            {
              name: "update",
              description: "Access to all update endpoints"
            },
            {
              name: "delete",
              description: "Access to all delete endpoints"
            },
            {
              name: "associate",
              description: "Access to all association endpoints"
            },
            {
              name: "nothing",
              description: "Permission with no use."
            }
          ];
          return RestHapi.create(models.permission, permissions, Log);
        })
        .then(function (result) {
          permissions = result;
          Log.log("seeding groups");
          groups = [
            {
              name: "Editors",
              description: "Admins that can only update users."
            },
            {
              name: "Managers",
              description: "Admins that can only change users' permissions."
            },
            {
              name: "Creator",
              description: "Admin that can create and modify but not delete a user."
            }
          ];
          return RestHapi.create(models.group, groups, Log);
        })
        .then(function (result) {
          groups = result;
          Log.log("seeding users");
          users = [
            {
              firstName: 'test',
              lastName: 'user',
              email: 'test@user.com',
              password: password,
              role: roles[0]._id,
              isActive: true
            },
            {
              firstName: 'test',
              lastName: 'useless',
              email: 'test@useless-user.com',
              password: password,
              role: roles[0]._id,
              isActive: true
            },
            {
              firstName: 'test',
              lastName: 'admin',
              email: 'test@admin.com',
              password: password,
              role: roles[1]._id,
              isActive: true
            },
            {
              firstName: 'test',
              lastName: 'editor',
              email: 'test@editor.com',
              password: password,
              role: roles[1]._id,
              isActive: true
            },
            {
              firstName: 'test',
              lastName: 'manager',
              email: 'test@manager.com',
              password: password,
              role: roles[1]._id,
              isActive: true
            },
            {
              firstName: 'test',
              lastName: 'manager',
              email: 'test@creator.com',
              password: password,
              role: roles[1]._id,
              isActive: true
            },
            {
              firstName: 'test',
              lastName: 'superadmin',
              email: 'test@superadmin.com',
              password: password,
              role: roles[2]._id,
              isActive: true
            }
          ];
          return RestHapi.create(models.user, users, Log);
        })
        .then(function (result) {
          users = result;

          Log.log("setting associations");

          return RestHapi.list(models.permission, { name: [
            'root',
            'updateUser',
            'readUser',
            'deleteUser',
            'user',
            'addUserPermissions',
            'removeUserPermissions',
            'nothing',
          ] }, Log)
            .then(function (result) {
              permissions = result.docs;

              promises = [];

              promises.push(RestHapi.addMany(models.role, roles[0]._id, models.permission, "permissions", [
                { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'readUser'; })._id }
              ], Log));

              return Q.all(promises)
                .then(function(result) {
                  promises = [];

                  promises.push(RestHapi.addMany(models.role, roles[1]._id, models.permission, "permissions", [
                    { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'updateUser'; })._id },
                    { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'readUser'; })._id },
                    { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'addUserPermissions'; })._id },
                    { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'removeUserPermissions'; })._id }
                  ], Log));

                  return Q.all(promises);
                })
                .then(function(result) {
                  promises = [];

                  promises.push(RestHapi.addMany(models.role, roles[2]._id, models.permission, "permissions", [
                    { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'root'; })._id },
                  ], Log));

                  return Q.all(promises);
                })
                .then(function(result) {
                  promises = [];

                  promises.push(RestHapi.addMany(models.group, groups[0]._id, models.permission, "permissions", [
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'addUserPermissions'; })._id },
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'removeUserPermissions'; })._id }
                  ], Log));

                  return Q.all(promises);
                })
                .then(function(result) {
                  promises = [];

                  promises.push(RestHapi.addMany(models.group, groups[1]._id, models.permission, "permissions", [
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'updateUser'; })._id },
                  ], Log));

                  return Q.all(promises);
                })
                .then(function(result) {
                  promises = [];

                  promises.push(RestHapi.addMany(models.group, groups[2]._id, models.permission, "permissions", [
                    { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'user'; })._id },
                    { state: PERMISSION_STATES.FORBIDDEN, childId: permissions.find(function (p) { return p.name === 'deleteUser'; })._id },
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'addUserPermissions'; })._id },
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'removeUserPermissions'; })._id },
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'updateUser'; })._id },
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'readUser'; })._id }
                  ], Log));

                  return Q.all(promises);
                })
                .then(function(result) {
                  promises = [];

                  promises.push(RestHapi.addMany(models.user, users[1]._id, models.permission, "permissions", [
                    { state: PERMISSION_STATES.EXCLUDED, childId: permissions.find(function (p) { return p.name === 'readUser'; })._id },
                    { state: PERMISSION_STATES.INCLUDED, childId: permissions.find(function (p) { return p.name === 'nothing'; })._id }
                  ], Log));

                  return Q.all(promises);
                })
                .then(function(result) {
                  promises = [];

                  promises.push(RestHapi.addMany(models.user, users[3]._id, models.group, "groups", [groups[0]._id], Log));
                  promises.push(RestHapi.addMany(models.user, users[4]._id, models.group, "groups", [groups[1]._id], Log));
                  promises.push(RestHapi.addMany(models.user, users[5]._id, models.group, "groups", [groups[2]._id], Log));

                  return Q.all(promises);
                });
            });
        })
        .then(function (result) {
          return gulp.src("")
            .pipe(exit());
        })
        .catch(function (error) {
          Log.error(error);
        });
    });
});

gulp.task('update-permissions', [], function () {
  RestHapi.config.loglevel = "DEBUG";
  const Log = RestHapi.getLogger("update-permissions");

  return updatePermissions()
    .then(function (result) {

      return gulp.src("")
        .pipe(exit());
    })
    .catch(function (error) {
      Log.error(error);
    });
});

/**
 * A function that generates permissions relevant to each model.
 * NOTE: If some permissions already exist, you might receive a "duplicate key" error, however all generated
 * permissions that don't already exist should still be successfully added.
 * @returns {Promise|Promise.<TResult>|*}
 */
function updatePermissions() {
  RestHapi.config.loglevel = "DEBUG";
  const Log = RestHapi.getLogger("update-permissions");

  let promise = {};

  if (models) {
    promise = Q.when(models);
  }
  else {
    Mongoose.Promise = Q.Promise;

    RestHapi.config = restHapiConfig;
    RestHapi.config.absoluteModelPath = true;
    RestHapi.config.modelPath = __dirname + "/../server/models";

    Mongoose.connect(restHapiConfig.mongo.URI);

    promise = RestHapi.generateModels(Mongoose);
  }
  return promise
    .then(function (result) {
      models = result;

      let promises = [];

      for (const modelKey in models) {
        const model = models[modelKey];
        const modelName = model.collectionName[0].toUpperCase() + model.collectionName.slice(1);
        const permissions = [];

        permissions.push({ name: model.collectionName, description: "Full access to " + model.collectionName + " endpoints"});
        permissions.push({ name: "create" + modelName, description: "Can create a " + model.collectionName });
        permissions.push({ name: "read" + modelName, description: "Can read a " + model.collectionName });
        permissions.push({ name: "update" + modelName, description: "Can update a " + model.collectionName });
        permissions.push({ name: "delete" + modelName, description: "Can delete a " + model.collectionName });
        permissions.push({
          name: "associate" + modelName,
          description: "Can modify associations for a " + model.collectionName
        });

        const associations = model.routeOptions.associations;

        for (const key in associations) {

          if (associations[key].type === "MANY_MANY" || associations[key].type === "ONE_MANY") {
            const associationName = key[0].toUpperCase() + key.slice(1);

            permissions.push({
              name: "add" + modelName + associationName,
              description: "Can add " + key + " to a " + model.collectionName
            });
            permissions.push({
              name: "remove" + modelName + associationName,
              description: "Can remove " + key + " from a " + model.collectionName
            });
            permissions.push({
              name: "get" + modelName + associationName,
              description: "Can get a " + model.collectionName + "'s " + key
            });
          }

        }

        promises.push(RestHapi.create(models.permission, permissions, Log));

      }

      return Q.allSettled(promises)
        .then(function (result) {
          Log.log("Permissions Updated");
        })
        .catch(function (error) {
          Log.error(error);
        });
    });
}

/**
 * Drops all of the base collections before seeding.
 * @param models
 * @returns {Promise.<TResult>|Promise}
 */
function dropCollections(models) {
  RestHapi.config.loglevel = "LOG";
  const Log = RestHapi.getLogger("unseed");

  Log.log("removing users");
  return models.user.remove({})
    .then(function () {
      Log.log("removing roles");
      return models.role.remove({});
    })
    .then(function () {
      Log.log("removing groups");
      return models.group.remove({});
    })
    .then(function () {
      Log.log("removing permissions");
      return models.permission.remove({});
    })
    .then(function () {
      Log.log("removing sessions");
      return models.session.remove({});
    })
    .then(function () {
      Log.log("removing authAttempts");
      return models.authAttempt.remove({});
    })
    .catch(function (error) {
      Log.error(error);
    });
}
