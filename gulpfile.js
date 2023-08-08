import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'gulp-csso';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import { deleteSync } from 'del';
import posthtml from 'gulp-posthtml';
import include from 'posthtml-include';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminOptipng from 'imagemin-optipng';

gulp.task("clean", function (done) {
  done()
  return deleteSync(["build"]);
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/images/**/*.svg",
    "source/js/**"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("style", function (done) {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"));
  done()
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task('images', () => {
  return gulp.src('source/images/**/*.{png,jpg}')
    .pipe(imagemin([
      imageminMozjpeg({ quality: 80, progressive: true }),
      imageminOptipng({ optimizationLevel: 2 }),
    ]))
    .pipe(gulp.dest("build/images"));
})

gulp.task('build', gulp.series(
  "clean",
  "copy",
  "images",
  "style",
  "html"));

gulp.task("server", function (done) {
  browser.init({
    server: {
      baseDir: "build/"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
});

gulp.task('reload', function (done) {
  browser.reload()
  done()
});

gulp.task("watcher", function (done) {
  gulp.watch('source/sass/**/*.scss', gulp.series('style', 'reload'));
  gulp.watch('source/*.html', gulp.series('html', 'reload'));
  done();
});

gulp.task('serve', gulp.series(
  "server",
  "watcher"));
