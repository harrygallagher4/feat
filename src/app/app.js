import _ from 'lodash'
import Q from 'q'

import Spotify from './lib/spotify'
import config from './config'

function log(o) {
  console.log(JSON.stringify(o, null, 1))
}

const spotify_client_id = config.spotify.client_id
const spotify_access_token = config.spotify.token.access_token

let spot = new Spotify(spotify_client_id, spotify_access_token, 'US')

function getArtistNode(artist) {
  let name, features

  return spot.searchArtist(artist)
  .then(artists => {
    let artist = artists.artists.items[0]
    name = artist.name
    return artist.id
  })
  .then(id => spot.getArtistAlbums(id))
  .then(albums => _.pluck(albums.items, 'id'))
  .then(ids => spot.getAlbums(ids))
  .then(albums => {
    features = _(albums.albums)
    .pluck('tracks.items')
    .flatten()
    .pluck('artists')
    .flatten()
    .pluck('name')
    .uniq()
    .without(name)
    .value()

    return {
      name, features
    }
  })
}

let seeds = ['asap rocky', 'schoolboy q', 'kendrick lamar', 'drake',
'2 chainz', 'danny brown', 'action bronson', 'asap ferg']
let nodes = Q.all(seeds.map(getArtistNode))
Q.allSettled(nodes)
.then(nodes => {
  log(nodes)
})
.done()

