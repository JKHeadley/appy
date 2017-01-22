'use strict';

const Gulp = require('gulp');

Gulp.paths = {
  src: './api',
  build: './build',
  tmp: './tmp',
  dev: 'dev'
};

require('require-dir')('./gulp');

Gulp.task('default', function () {
  Gulp.start('serve:local');
});
