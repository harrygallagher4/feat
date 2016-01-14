import fs from 'fs'
import querystring from 'querystring'

import express from 'express'
import request from 'request'
import _ from 'lodash'

import config from '../config'

const { client_id, client_secret } = config.spotify

const authorization = ('Basic ' + (new Buffer(`${client_id}:${client_secret}`).toString('base64')))
const redirect_uri = 'http://localhost:8080/callback'

/*
 * Ideally this would be more dynamic.
 * Specifically, any function should be able to be passed to *bs as
 * `check` and `config`.
 *
 * Maybe it'll be that way someday.
 */
class AppBootstrap {

  constructor(ready) {
    this.ready = ready
  }

  checkHasToken() {
    return !!config.spotify.token
  }

  configureToken() {
    let app = express()
    let server

    app.get('/callback', (req, res) => {
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
          res.send('Error fetching authentication token. Check the console for details.')

          console.log(error)
          console.log(body)

          this._bs.next()
        } else {
          res.send('Authenticated successfully. Saving token.')

          config.spotify.token = body
          fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))

          console.log('Updated and wrote config.')

          this._bs.next()
        }
        setTimeout(() => { server.close() }, 1)
      })
    })

    app.get('/auth', (req, res) => {
      let authorizeBody = querystring.encode({
        client_id,
        response_type: 'code',
        redirect_uri,
        scope: ['playlist-read-private', 'playlist-read-collaborative', 'playlist-modify-public', 'playlist-modify-private'].join(' ')
      })

      let authUrl = `https://accounts.spotify.com/authorize?${authorizeBody}`
      res.redirect(authUrl)
    })

    console.log('Navigate to http://localhost:8080/auth to configure')
    server = app.listen(8080)
  }

  *bs(check, config, done) {
    yield (check() ? done() : config())
  }

  bootstrap() {
    this._bs = new this.bs(this.checkHasToken, _.bind(this.configureToken, this), this.ready)
    this._bs.next()
  }

}

export default AppBootstrap
