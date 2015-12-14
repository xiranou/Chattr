var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  jshint = require('gulp-jshint');

gulp.task('sass', function () {
  return gulp.src('./public/css/style.scss')
    .pipe(sass())
    .pipe(rename('application.css'))
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('jshint', function () {
  return gulp.src(['./public/js/**/*.js', '!./public/js/application.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
  gulp.watch('./public/css/**/*.scss', ['sass']);
  gulp.watch('./public/js/**/*.js', ['jshint']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js coffee handlebars',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('default', [
  'sass',
  'develop',
  'watch'
]);
