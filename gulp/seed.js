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

      let users = [];
      let admins = [];

      return dropCollections(models)
        .then(function (result) {
          Log.log("seeding users");
          users = [
            {
              firstName: 'test',
              lastName: 'admin',
              email: 'admin@appy.com',
              password: password,
              role: USER_ROLES.ADMIN
            }
          ];
          return RestHapi.create(models.user, users, Log);
        })
        .then(function (result) {
          users = result;
          Log.log("seeding admin profiles");
          admins = [
            {
              user: users[0]._id,
            }
          ];
          return RestHapi.create(models.admin, admins, Log);
        })
        .then(function (result) {
          admins = result;
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

  return models.user.remove({})
    .then(function () {
      Log.log('users removed');
      return models.admin.remove({});
    })
    .then(function () {
      Log.log('admins removed');
    })
    .catch(function (error) {
      Log.error(error);
    });
}
