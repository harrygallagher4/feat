import express from 'express'
import gracefulExit from 'express-graceful-exit'

import SpotifyAuth from './SpotifyAuth'

console.log('STARTING')

const app = express()

app.use(gracefulExit.middleware(app))
app.use(express.static('build/'))


app.get('/hello', (req, res) => {
  res.send('Hello, world!')
})

SpotifyAuth(app)

export default app
