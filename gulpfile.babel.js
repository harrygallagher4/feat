import babel from 'babelify'
import browserify from 'browserify'
import buffer from 'vinyl-buffer'
import del from 'del'
import gulp from 'gulp'
import path from 'path'
import rename from 'gulp-rename'
import source from 'vinyl-source-stream'
import supervisor from 'gulp-supervisor'

const src = './src'
const build = './build'
const app = 'app/app.jsx'
const appDest = 'js/'

gulp.task('build', ['copy'], () => {
  let appMain = path.join(src, app)
  let appTarget = path.join(build, appDest)

  let b = browserify({
    entries: appMain,
    transform: [babel]
  })

  return b.bundle()
  .pipe(source(appMain))
  .pipe(buffer())
  .pipe(rename({
    dirname: '',
    extname: '.js'
  }))
  .pipe(gulp.dest(appTarget))
})

gulp.task('copy', ['clean'], () => {
  let publicSource = path.join(src, 'public')
  let publicTarget = build

  return gulp.src([`${publicSource}/**/*`])
  .pipe(gulp.dest(publicTarget))
})

gulp.task('clean', () => {
  let appTarget = path.join(build, appDest)
  console.log(appTarget)
  return del([
    `build/**/*`,
    `!build/js`,
    `!build/js/app.js`
  ])
})

gulp.task('watch:app', ['build'], () => {
  return gulp.watch(path.join(src, app), ['build'])
})

gulp.task('watch:public', ['copy'], () => {
  let publicGlob = `${path.join(src, 'public')}/**/*`
  return gulp.watch(publicGlob, ['copy'])
})

gulp.task('watch', ['watch:app', 'watch:public'])

gulp.task('server', () => {
  supervisor('app', {
    watch: [path.join(src, 'api')]
  })
})

gulp.task('default', ['server', 'watch'])
