'use strict';

var gulp = require('gulp');
var exit = require('gulp-exit');
var Q = require('q');
var mongoose = require('mongoose');
const Config = require('../config');
const USER_ROLES = Config.get('/constants/USER_ROLES');
let restHapi = require('rest-hapi');
let restHapiConfig = Config.get('/restHapiConfig');

gulp.task('seed', [], function() {

    mongoose.Promise = Q.Promise;

    restHapi.config = restHapiConfig;
    restHapi.config.absoluteModelPath = true;
    restHapi.config.modelPath = __dirname + "/../api/models";

    mongoose.connect(Config.get('/restHapiConfig/mongo/URI'));

    return restHapi.generateModels(mongoose).then(function (models) {

        restHapi.config.loglevel = "DEBUG";
        let Log = restHapi.getLogger("seed");

        let users = [],
            admins = [];

        var password = "root";

        return dropCollections(models)
            .then(function (result) {
                Log.log("seeding users");
                users = [
                    {
                        firstName: 'test',
                        lastName: 'admin',
                        email: 'admin@scal.io',
                        password: password,
                        role: USER_ROLES.ADMIN
                    }
                ];
                return restHapi.create(models.user, users, Log);
            })
            .then(function (result) {
                users = result;
                Log.log("seeding admin profiles");
                admins = [
                    {
                        user: users[0]._id,
                    }
                ];
                return restHapi.create(models.admin, admins, Log);
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
    restHapi.config.loglevel = "LOG";
    let Log = restHapi.getLogger("unseed");
    return models.user.remove({})
        .then(function() {
            Log.log('users removed');
            return models.admin.remove({});
        })
        .then(function() {
            Log.log('admins removed');
            deferred.resolve();
        })
        .catch(function (error) {
            Log.error(error);
        });
}
