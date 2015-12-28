var plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

module.exports = function (gulp, config) {
  var paths = config.paths;

  gulp.task('build-js', function () {
    return gulp.src(paths.js)
      .pipe(concat('application.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./public/js'));
  });

  gulp.task('build-css', function () {
    return gulp.src(paths.css)
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(rename('application.css'))
      .pipe(gulp.dest('./public/css'));
  });

  gulp.task('build:prod', [
    'build-js',
    'build-css'
  ]);
};
