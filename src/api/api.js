import express from 'express'
import SpotifyAuth from './SpotifyAuth'

const app = express()

app.use(express.static('src/dist'))

app.get('/hello', (req, res) => {
  res.send('Hello, world!')
})

SpotifyAuth(app)

app.listen(8080, () => {})
