import request from 'request'
import querystring from 'querystring'
import config from './config'

const { port } = config
const { client_id, client_secret } = config.spotify
const authorization = ('Basic ' + (new Buffer(`${client_id}:${client_secret}`).toString('base64')))
const redirect_uri = `http://localhost:${port}/callback`

function auth(req, res) {
  let authorizeBody = querystring.encode({
    client_id,
    response_type: 'code',
    redirect_uri,
    scope: ['playlist-read-private', 'playlist-read-collaborative', 'playlist-modify-public', 'playlist-modify-private'].join(' ')
  })

  let authUrl = `https://accounts.spotify.com/authorize?${authorizeBody}`
  res.redirect(authUrl)
}

function callback(req, res) {
  let { code } = req.query
  let auth = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': authorization
    },
    json: true
  }

  request.post(auth, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      res.send('Error fetching authentication token. Check console for details.')

      console.log(error)
      console.log(body)
    } else {
      res.redirect(`/#${querystring.encode(body)}`)
    }
  })
}

function attach(app) {
  app.get('/auth', auth)
  app.get('/callback', callback)
}

export default attach
