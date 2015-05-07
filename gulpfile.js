/*global -$ */
'use strict';
// generated on 2015-04-23 using generator-gulp-webapp 0.3.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('styles', function () {
  return gulp.src('example/styles/main.css')
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('example-js', function () {
  return gulp.src('example/scripts/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'example', '.']});

  return gulp.src('example/*.html')
    .pipe(assets)
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('extras', function () {
  return gulp.src([
    'example/*.*',
    '!example/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('.tmp'));
});

gulp.task('clean', require('del').bind(null,
  ['.tmp', 'dist', 'maps', 'goku.js', 'goku.min.js']));

gulp.task('install', function() {
  return gulp.src([
    './bower.json',
    './package.json']
  ).pipe($.install());
});

gulp.task('serve', ['styles', 'build'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: '.tmp',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'example/*.html',
    'example/scripts/**/*.js',
    'example/images/**/*',
    'src/**/*.js'
  ]).on('change', reload);

  gulp.watch('example/**/*', ['html', 'example-js'])
  gulp.watch('src/**/*.js', ['core']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('example/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('example'));
});

gulp.task('core', function() {
  return gulp.src('src/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.concat('goku.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('./'))
    .pipe($.uglify())
    .pipe($.concat('goku.min.js'))
    .pipe($.sourcemaps.write('maps'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('./'));
});

gulp.task('build', ['core', 'example-js', 'html', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean', 'install'], function () {
  gulp.start('build');
});
