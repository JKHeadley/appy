'use strict';

const gulp = require('gulp');
const exit = require('gulp-exit');
const Q = require('q');
const Mongoose = require('mongoose');
const RestHapi = require('rest-hapi');

const Config = require('../config');

const restHapiConfig = Config.get('/restHapiConfig');
const USER_ROLES = Config.get('/constants/USER_ROLES');

gulp.task('seed', [], function () {

  Mongoose.Promise = Q.Promise;

  RestHapi.config = restHapiConfig;
  RestHapi.config.absoluteModelPath = true;
  RestHapi.config.modelPath = __dirname + "/../server/models";

  Mongoose.connect(restHapiConfig.mongo.URI);

  return RestHapi.generateModels(Mongoose)
    .then(function (models) {

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
              name: "updateUser",
              description: "Can update a user."
            },
            {
              name: "readUser",
              description: "Can read a user."
            },
            {
              name: "editPermissions",
              description: "Can add and remove permissions."
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
            }
          ];
          return RestHapi.create(models.group, groups, Log);
        })
        .then(function(result) {
          groups = result;
          Log.log("seeding users");
          users = [
            {
              email: 'test@user.com',
              password: password,
              role: roles[0]._id,
              isActive: true
            },
            {
              email: 'test@user_no_read.com',
              password: password,
              role: roles[0]._id,
              isActive: true
            },
            {
              email: 'test@admin.com',
              password: password,
              role: roles[1]._id,
              isActive: true
            },
            {
              email: 'test@editor.com',
              password: password,
              role: roles[1]._id,
              isActive: true
            },
            {
              email: 'test@manager.com',
              password: password,
              role: roles[1]._id,
              isActive: true
            },
            {
              email: 'test@superadmin.com',
              password: password,
              role: roles[2]._id,
              isActive: true
            }
          ];
          return RestHapi.create(models.user, users, Log);
        })
        .then(function(result) {
          users = result;

          Log.log("setting associations");

          promises = [];
          promises.push(RestHapi.addMany(models.role, roles[0], models.permission, "permissions", [permissions[2]._id], Log));
          promises.push(RestHapi.addMany(models.role, roles[1], models.permission, "permissions", [permissions[1]._id, permissions[2]._id, permissions[3]._id], Log));
          promises.push(RestHapi.addMany(models.role, roles[2], models.permission, "permissions", [permissions[0]._id], Log));

          promises.push(RestHapi.addMany(models.group, groups[0], models.permission, "permissions", [{ enabled: false, childId: permissions[3]._id}], Log));
          promises.push(RestHapi.addMany(models.group, groups[1], models.permission, "permissions", [{ enabled: false, childId: permissions[1]._id}], Log));

          promises.push(RestHapi.addMany(models.user, users[1], models.permission, "permissions", [{ enabled: false, childId: permissions[2]._id}], Log));


          promises.push(RestHapi.addMany(models.user, users[3], models.group, "groups", [groups[0]._id], Log));
          promises.push(RestHapi.addMany(models.user, users[4], models.group, "groups", [groups[1]._id], Log));

          return Q.all(promises);
        })
        .then(function (result) {

          return gulp.src("")
            .pipe(exit());
        })
        .catch(function (error) {
          Log.error(error);
        })
    })
});


function dropCollections(models) {
  RestHapi.config.loglevel = "LOG";
  const Log = RestHapi.getLogger("unseed");

  Log.log("removing users");
  return models.user.remove({})
    .then(function() {
      Log.log("removing roles");
      return models.role.remove({});
    })
    .then(function() {
      Log.log("removing groups");
      return models.group.remove({});
    })
    .then(function() {
      Log.log("removing permissions");
      return models.permission.remove({});
    })
    .catch(function (error) {
      Log.error(error);
    });
}
