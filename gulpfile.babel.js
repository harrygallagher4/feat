import babel from 'babelify'
import browserify from 'browserify'
import buffer from 'vinyl-buffer'
import del from 'del'
import gulp from 'gulp'
import path from 'path'
import source from 'vinyl-source-stream'
import supervisor from 'gulp-supervisor'

const src = './src'
const build = './build'
const app = 'app/app.js'
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
  .pipe(gulp.dest(appTarget))
})

gulp.task('copy', ['clean'], () => {
  let publicSource = path.join(src, 'public')
  let publicTarget = build

  return gulp.src([`${publicSource}/**/*`])
  .pipe(gulp.dest(publicTarget))
})

gulp.task('clean', () => {
  return del([
    `${build}/**/*`    
  ]) 
})

gulp.task('watch:app', () => {
  return gulp.watch(app, ['build'])
})

gulp.task('watch', ['watch:app'])

gulp.task('server', () => {
  supervisor('app', {
    watch: [path.join(src, 'api')]
  })
})

gulp.task('default', ['build'])
