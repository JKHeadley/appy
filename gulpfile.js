'use strict';

var gulp = require('gulp');

gulp.paths = {
  src: './api',
  build: './build',
  tmp: './tmp',
  dev: 'dev'
};

require('require-dir')('./gulp');

gulp.task('default', function () {
  gulp.start('serve:local');
});
