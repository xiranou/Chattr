var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  childProcess = require('child_process');

var paths = {
  js: ['./public/js/**/*.js', '!./public/js/application.js', '!./public/js/vendor.js'],
  css: ['./public/css/style.scss'],
  components: ['./public/components/jquery/dist/jquery.min.js']
};

gulp.task('sass', function () {
  return gulp.src(paths.css)
    .pipe(sass())
    .pipe(rename('application.css'))
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('jshint', function () {
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', function () {
  return gulp.src(paths.js)
    .pipe(concat('application.js'))
    .pipe(gulp.dest('./public/js'))
    .pipe(livereload());
});

gulp.task('vendor-js', function () {
  return gulp.src(paths.components)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./public/js'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('public/css/**/*.scss', ['sass']);
  gulp.watch('public/js/**/*.js', ['jshint', 'scripts']);
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

gulp.task('redis-start', function () {
  childProcess.exec('redis-server', function (err, stdout, stderr) {
    console.log(stdout);
    if (err !== null) {
      console.log('exec error: ' + err);
    }
  });
});

gulp.task('default', [
  'vendor-js',
  'sass',
  'scripts',
  'redis-start',
  'develop',
  'watch'
]);

// prod build
//

gulp.task('build-js', function () {
  return gulp.src(paths.js)
    .pipe(concat('application.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('build-vendor', function () {
  return gulp.src(paths.components)
    .pipe(concat('vendor.js'))
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
  'build-vendor',
  'build-css'
]);