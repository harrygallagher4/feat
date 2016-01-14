import gulp from 'gulp'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import browserify from 'browserify'
import babel from 'babelify'

const app = './app.js'
const app_dest = './app/js/'

gulp.task('build', () => {
  let b = browserify({
    entries: app,
    transform: [babel]
  })

  return b.bundle()
  .pipe(source('app.js'))
  .pipe(buffer())
  .pipe(gulp.dest(app_dest))
})

gulp.task('watch:app', () => {
  gulp.watch(app, ['build'])
})

gulp.task('watch', ['watch:app'])

gulp.task('default', ['build'])
