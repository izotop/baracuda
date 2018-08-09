"use strict";

/*-------------------------------------------------------------------
    Required plugins
-------------------------------------------------------------------*/
const gulp = require('gulp'),
    rigger = require('gulp-rigger'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    mainBowerFiles = require('main-bower-files'),
    flatten = require('gulp-flatten'),
    newer = require('gulp-newer'),
    gulpIf = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    smushit = require('gulp-smushit'),
    cache = require('gulp-cache'),
    spritesmith = require('gulp.spritesmith'),
    stripCssComments = require('gulp-strip-css-comments'),
    buffer = require('vinyl-buffer'),
    merge = require('merge-stream'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

/*-------------------------------------------------------------------
    Development or Production
-------------------------------------------------------------------*/
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

/*-------------------------------------------------------------------
    HTML
-------------------------------------------------------------------*/
gulp.task('html', function () {
    return gulp.src('src/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('build'))
        .pipe(reload({stream: true}));
});

/*-------------------------------------------------------------------
    CSS
-------------------------------------------------------------------*/
gulp.task('css', function () {
    var processors = [
        autoprefixer({
            browsers: ['last 10 versions'],
            cascade: true
        })
    ];
    return gulp.src('src/scss/*.scss')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
});

/*-------------------------------------------------------------------
    JavaScript
-------------------------------------------------------------------*/
gulp.task('js', function () {
    return gulp.src('src/js/main.js')
        .pipe(rigger())
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.stream());
});

/*-------------------------------------------------------------------
    JavaScript Plugins
-------------------------------------------------------------------*/
gulp.task('js:plugins', function () {
    return gulp.src(mainBowerFiles({
        "overrides": {
            "jquery": {
                "main": "dist/jquery.min.js"
            },
            "slick-carousel": {
                "main": [
                    "slick/slick.min.js",
                    "slick/slick.css"
                ]
            },
            "air-datepicker": {
                "main": [
                    "dist/js/datepicker.min.js",
                    "dist/css/datepicker.min.css"
                ]
            },
            "jquery-nice-select": {
                "main": [
                    "js/jquery.nice-select.min.js",
                    "css/nice-select.css"
                ]
            }
        }
    }), {base: "src/js/plugins"})
        .pipe(flatten({includeParents: 1}))
        .pipe(newer('build/js/plugins'))
        .pipe(gulp.dest('build/js/plugins'))
});

/*-------------------------------------------------------------------
    Fonts
-------------------------------------------------------------------*/
gulp.task('fonts', function () {
    return gulp.src('src/fonts/**/*.*')
        .pipe(newer('build/fonts'))
        .pipe(gulpIf(isDevelopment, gulp.symlink('build/fonts'), gulp.dest('build/fonts')));
});

/*-------------------------------------------------------------------
    Favicon
-------------------------------------------------------------------*/
gulp.task('favicon', function () {
    return gulp.src('src/*.ico', {base: "src"})
        .pipe(newer('build'))
        .pipe(gulpIf(isDevelopment, gulp.symlink('build'), gulp.dest('build')))
});

/*-------------------------------------------------------------------
    Images
-------------------------------------------------------------------*/
gulp.task('images', function () {
    return gulp.src('src/images/**/*.{jpg,png,gif}', {base: "src/images"})
        .pipe(newer('build/images'))
        .pipe(gulpIf(!isDevelopment, cache(imagemin({progressive: true}))))
        .pipe(gulpIf(isDevelopment, gulp.symlink('build/images'), gulp.dest('build/images')))
});

/*-------------------------------------------------------------------
    Spritesheet
-------------------------------------------------------------------*/
gulp.task('spritesheet', function () {
    var spriteData = gulp.src('src/spritesheet/*.png').pipe(spritesmith({
        imgName: 'spritesheet.png',
        cssName: '_spritesheet.scss',
        imgPath: '../images/spritesheet.png'
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(gulpIf(!isDevelopment, cache(imagemin({progressive: true}))))
        .pipe(gulp.dest('src/images'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(stripCssComments())
        .pipe(gulp.dest('src/scss/partials'));

    return merge(imgStream, cssStream);
});

/*-------------------------------------------------------------------
    Clean
-------------------------------------------------------------------*/
gulp.task('clean', function () {
    return del('build');
});

/*-------------------------------------------------------------------
    Watchers
-------------------------------------------------------------------*/
gulp.task('watch', function () {
    gulp.watch('src/**/*.html', gulp.series('html'));
    gulp.watch('src/scss/**/*.scss', gulp.series('css'));
    gulp.watch('src/js/*.js', gulp.series('js'));
    gulp.watch('src/images/**/*', gulp.series('images'));
    gulp.watch('src/spritesheet/*', gulp.series('spritesheet'));
});

/*-------------------------------------------------------------------
    Browser sync
-------------------------------------------------------------------*/
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: "build"
        },
      tunnel: "baracuda",
      host: 'localhost',
      port: 9000,
      logPrefix: "Baracuda",
      directory: true,
      browser: "chrome",
      open: false
    });
});

/*-------------------------------------------------------------------
    Global
-------------------------------------------------------------------*/
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'js', 'js:plugins', 'fonts', 'favicon', 'images')));
gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));