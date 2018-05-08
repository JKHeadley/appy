'use strict';

const Gulp = require('gulp');
const Gutil = require('gulp-util');
const Nodemon = require('gulp-nodemon');

Gulp.task('serve:local', function () {
  Gutil.env.env = 'local';
  Gutil.log("Environment '%s'", Gutil.colors.cyan(Gutil.env.env));

  return serve('local');
});

Gulp.task('serve:development', function () {
  Gutil.env.env = 'development';
  Gutil.log("Environment '%s'", Gutil.colors.cyan(Gutil.env.env));

  return serve('development');
});

Gulp.task('serve:production', function () {
  Gutil.env.env = 'production';
  Gutil.log("Environment '%s'", Gutil.colors.cyan(Gutil.env.env));

  return serve('production');
});

const serve = function (env) {
  return Nodemon({
    script: Gulp.paths.src + 'index',
    ext: 'js',
    env: { 'NODE_ENV': env },
  }).on('start', function () {
    console.log('**starting**');
  }).on('restart', function () {
    console.log('**restarting**');
  });
};
