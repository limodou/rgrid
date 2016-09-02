var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    del = require('del'),
    riot = require('gulp-riot'),
    livereload = require('gulp-livereload');

gulp.task('css', function() {
  return gulp.src(['src/*.css'])
    // .pipe(jshint('.jshintrc'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss().on('error', function(e){
            console.log(e);
         }))
     .pipe(gulp.dest('dist/'))
    // .pipe(notify({ message: 'js-main task complete' }));
});

gulp.task('js', function() {
  return gulp.src(['src/*.js'])
    // .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
     .pipe(gulp.dest('dist/'))
    // .pipe(notify({ message: 'js-main task complete' }));
});

gulp.task('tags', function() {
  return gulp.src(['src/*.tag'])
    .pipe(riot())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
    .pipe(gulp.dest('dist/'))
    // .pipe(notify({ message: 'js-rest task complete' }));
});

gulp.task('watch', function() {
  gulp.start('js', 'css', 'tags');
  gulp.watch('src/*.tag', ['tags']);
  gulp.watch('src/*.js', ['js']);
});

gulp.task('default', function() {
    gulp.start('js', 'css', 'tags');
});
