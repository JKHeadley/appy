'use strict'

const Gulp = require('gulp')

Gulp.paths = {
  src: './'
}

require('require-dir')('./gulp')

Gulp.task('default', function() {
  Gulp.start('serve:local')
})
