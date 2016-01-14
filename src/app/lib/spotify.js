import request from 'request'
import Q from 'q'

const GET = 'GET'
const POST = 'POST'

class Spotify {

  constructor(client_id, access_token, country) {
    this.responses = []
    this.url = 'https://api.spotify.com/v1'

    this.client_id = client_id
    this.access_token = access_token
    this.country = country

    this.authorization = `Bearer ${access_token}`
  }

  generateRequest(method, endpoint, params) {
    if(params) {
      params.market = this.country
    }

    let r = {
      baseUrl: this.url,
      uri: endpoint,
      method,
      headers: {
        'Authorization': this.authorization
      },
      json: true
    }
    r[method === GET ? 'qs' : 'body'] = params

    return r
  }

  makeRequest(req) {
    let deferred = Q.defer()

    request(req, (err, res, body) => {
      if(err) {
        this.responses.unshift(err)
        deferred.reject(err)
      } else {
        this.responses.unshift(body)
        deferred.resolve(body)
      }
    })

    return deferred.promise
  }

  req(method, endpoint, params) {
    return this.makeRequest(this.generateRequest(method, endpoint, params))
  }

  me() {
    let deferred = Q.defer()

    let req = this.generateRequest(GET, '/me', undefined)
    request(req, (err, res, body) => {
      if(err)
        deferred.reject(err)
      else {
        this.user = body
        this.responses.unshift(body)
        deferred.resolve(body)
      }
    })

    return deferred.promise
  }

  createPlaylist(name) {
    return this.req(POST, `/users/${this.me.id}/playlists`, {
      name,
      'public': false
    })
  }

  addTracksToPlaylist(id, uris) {
    return this.req(POST, `/users/${this.me.id}/playlists/${id}/tracks`, {
      uris
    })
  }

  getArtistTopTracks(artist) {
    return this.req(GET, `/artists/${artist}/top-tracks`)
  }

  getAlbum(album) {
    return this.req(GET, `/albums/${album}`)
  }

  getAlbums(albums) {
    return this.req(GET, `/albums`, {
      ids: albums.join(',')
    })
  }

  getArtistAlbums(artist, params) {
    return this.req(GET, `/artists/${artist}/albums`, params)
  }

  searchArtist(name) {
    return this.req(GET, '/search', {
      q: name,
      type: 'artist',
      limit: 1
    })
  }
}

export default Spotify
