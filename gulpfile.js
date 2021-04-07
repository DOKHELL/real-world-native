
const { src, dest, watch, parallel, series, task } = require ('gulp');

const gulp        = require('gulp');
const scss         = require('gulp-sass');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require ('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const del          = require('del');

const pug = require('gulp-pug');

// function add() {
//     task('pug', function buildHTML() {
//         return src('app/Pug/*.pug')
//         .pipe(pug({
//             pretty:true
//         }))
//         .pipe(dest('app'));
//       });
// }

//   task('pug', function buildHTML() {
//   return src('app/Pug/*.pug')
//   .pipe(pug({
//       pretty:true
//   }))
//   .pipe(dest('app'));
// });
const paths = {
    src: 'src',
    dist: 'dist'
  };

const pugFiles = {
    src: paths.src + 'app/Pug/*.pug',
    dist: paths.dist,
    watch: paths.src + 'app/Pug/*.pug'
  }
  
  gulp.task('pug', function() {
    gulp.src(pugFiles.src)
      .pipe(pug({
        locals: {},
        pretty: true
      }))
      .pipe(gulp.dest(pugFiles.dist))
  });
  function reloadBrowserSyncPug() {
    setTimeout(reloadBrowserSync, 500);
  }
  



function browsersync() {
    browserSync.init({
        server : {
            baseDir: 'app/'
        }
    });
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/img/**/*')
    .pipe(imagemin(
        [
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest('dist/img'))
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/mixitup/dist/mixitup.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles(){    //styles-просто имя(название) функции
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'})) // outputStyle: 'compressed' нужен для сжатой версии css
        .pipe(concat('style.min.css')) //может еще и переименовувать файлы
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())

}
function build () {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*', // ** - это все папки, /* - это все файлы
        'app/js/main.min.js',
        'app/*.html',
        'app/Pug/*pug'
    ], {base:'app'})
    .pipe(dest('dist'))
}



function watching(){
    watch(['app/scss/**/*.scss'], styles );
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts ); // ! - этот знак означает кроме меня
    watch(['app/*.html']).on('change', browserSync.reload);
    // task('watch', function () {
    //     return watch('app/Pug/*.pug', { ignoreInitial: false })
    //     .pipe(dest('app'));
    //     });


        //  watch(['app/Pug/*.pug'], add );
    task('watch', [], function() {
        watch(pugFiles.watch, ['pug', reloadBrowserSyncPug]);
    })

}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;





exports.build = series(cleanDist, images, build );
exports.default = parallel(styles ,browsersync, watching, scripts);