const gulp = require('gulp'),
    browserSync = require('browser-sync'),
    livereload = require('gulp-livereload'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    webpack = require('webpack-stream'),
    gulpif = require('gulp-if'),
    VueLoaderPlugin = require('vue-loader/lib/plugin')


/* === Красивое отображение ошибок === */
const notify = require('gulp-notify')


function emit_end(err) {
    this.emit('end')
}
/* --- Красивое отображение ошибок --- */

/* === Файлы проекта === */

const conf = {
    src: './app',
    dest: './build',
    dest_assets: './build/assets'
}

const html_files = [
    conf.src + '/**/*.html',
]

const js_files = [
    '!' + conf.src + '/**/*.map',
    conf.src + '/**/*.js',
    conf.src + '/*.js',
    conf.src + '/**/*.vue',
    conf.src + '/*.vue'
]

const assets_files = [
    conf.src + '/assets/**/*.*'
]

var isDev = false // Прод

// let isDev = true // Дев

var isProd = !isDev

var webpack_config = {
    output: {
        filename: 'main.js'
    },
    module: {
        rules: [{
                test: /\.txt$|\.png$|\.jpg$|\.jpeg$|\.svg$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        fallback: 'file-loader',
                    },
                }, ],
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: '/node_modules/'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    hotReload: false
                }
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            indentedSyntax: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : 'none',
}

/* --- Файлы проекта --- */

// Пользовательские скрипты проекта

function browser_sync() {
    browserSync({
        server: {
            baseDir: conf.dest // './build'
        },
        notify: false,
        open: false,
        reloadOnRestart: true,
        cors: true,
    })
}

function js() {
    return gulp.src(conf.src + '/main.js')
        .pipe(webpack(webpack_config).on("error", notify.onError(function(error) {
            return "Error webpack: " + error.message;
        })).on('error', emit_end))
        .pipe(gulpif(isDev, sourcemaps.init({ loadMaps: true })))
        .pipe(gulpif(isDev, gulp.dest(conf.dest)))
        .pipe(gulpif(isProd, gulp.dest(conf.dest)))
        .pipe(gulpif(isDev, sourcemaps.write(conf.dest)))
        .pipe(browserSync.reload({ stream: true }))
        .pipe(livereload())
}

function html() {
    return gulp.src(html_files)
        .pipe(gulp.dest(conf.dest))
        .pipe(browserSync.reload({ stream: true }))
        .pipe(livereload())
}


gulp.task('watch', ['setDev', 'build', 'browser_sync'], function() {
    livereload.listen()

    gulp.watch(html_files, ['html'])
    gulp.watch(js_files, ['js'])
})

gulp.task('build', ['removedist', 'livereload2build', 'js'], function() {
    // return gulp.src(assets_files)
    //     .pipe(gulp.dest(conf.dest_assets))
})

function livereload2build() {
    if (isDev) {
        return gulp.src([
                conf.src + '/livereload.js',
                conf.src + '/index.html',
            ])
            .pipe(gulp.dest(conf.dest))
    }
}

function removedist() {
    try {
        return del.sync(conf.dest)
    } catch (err) {}
}

function setDev() {
    isDev = true
    isProd = false
    webpack_config.mode = isDev ? 'development' : 'production'
    webpack_config.devtool = isDev ? 'eval-source-map' : 'none'
}


gulp.task('browser_sync', browser_sync)
gulp.task('js', js)
gulp.task('html', html)
gulp.task('removedist', removedist)
gulp.task('livereload2build', livereload2build)
gulp.task('setDev', setDev)


gulp.task('default', ['watch'])