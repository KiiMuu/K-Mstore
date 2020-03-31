var gulp = require('gulp');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');
const watch = require('gulp-watch');
const autoprefixer = require('gulp-autoprefixer');
const connect = require('gulp-connect');
const nodemon = require('gulp-nodemon');
const concat = require('gulp-concat');


// gulp.task('express', function() {  
//     require('./app');
// });

gulp.task('nodemon', function() {
    nodemon({
        script: 'app.js',
        ext: 'js',
        ignore: ['/node_modules']
    })
    .on('restart', function() {
        console.log('>> node restart');
    })
});

gulp.task('watch', function() {
    gulp.watch('public/**/*.scss', gulp.series('sass'));
    gulp.watch('public/js/**/*.js', gulp.series('js-concat'));
});

// sass task
gulp.task('sass', function () {
    return gulp.src('public/scss/main.scss', {
        sourcemap: true,
        style: 'compressed'
    })
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('assets/css'))
    .pipe(connect.reload())
});

// Concat Task
gulp.task('js-concat', function() {
    return gulp.src(['public/js/*.js', 'public/js/*.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(connect.reload())
});

// default task
gulp.task('default', gulp.parallel('watch', 'nodemon'));