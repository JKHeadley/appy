var gulp = require('gulp');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');

gulp.task('serve:local', function () {
  gutil.env.env = 'local';
  gutil.log("Environment '%s'", gutil.colors.cyan(gutil.env.env));

  return serve('local');
});

gulp.task('serve:development', function () {
  gutil.env.env = 'development';
  gutil.log("Environment '%s'", gutil.colors.cyan(gutil.env.env));
  
  return serve('development');
});

gulp.task('serve:production', function () {
  gutil.env.env = 'production';
  gutil.log("Environment '%s'", gutil.colors.cyan(gutil.env.env));

  return serve('production');
});

var serve = function(env) {
  return nodemon({
    script: gulp.paths.src + '/api',
    ext: 'js',
    env: {'NODE_ENV': env},
  }).on('start', function () {
    console.log('**starting**');
  }).on('restart', function () {
    console.log('**restarting**');
  })
};