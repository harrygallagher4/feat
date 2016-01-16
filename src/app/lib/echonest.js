import http from 'http'
import querystring from 'querystring'
import _ from 'lodash'

class EchoNest {

  constructor(api_key, params) {
    this.params = _.assign(params || {}, { api_key })
    this.url = 'http://developer.echonest.com'
  }

  makeRequest(endpoint, params, callback) {
    params = querystring.encode(_.assign({}, this.params, params))
    let path = `${this.url}/api/v4/${endpoint}?${params}`

    http.get(path, res => {
      let body = '';
      res.on('data', data => body += data )
      res.on('end', () => callback(null, res, JSON.parse(body)) )
    })
    .on('error', e => callback(e, null, null) )
  }

  getArtist(artist, callback) {
    this.makeRequest('artist/search', {
      name: artist,
      results: 1
    }, (err, res, body) => {
      if (err)
        callback(err, null, null)
      else
        callback(null, res, body.response.artists[0])
    })
  }

  getSimilarArtists(artist, callback) {
    this.makeRequest('artist/similar', {
      id: artist,
      results: 15
    }, (err, res, body) => {
      if (err)
        callback(err, null, null)
      else
        callback(null, res, body.response.artists)
    })
  }

  getSongsByArtist(artist, callback) {
    this.makeRequest('song/search', {
      artist_id: artist,
      sort: 'song_hotttnesss-desc',
      bucket: ['song_hotttnesss', 'audio_summary', 'id:spotify', 'tracks'],
      results: 15 
    }, (err, res, body) => {
      if (err)
        callback(err, null, null)
      else
        callback(null, res, body.response.songs)
    })
  }

}

export default EchoNest
