import _ from 'lodash'
import Q from 'q'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Spotify from './lib/spotify'

function log(o) {
  console.log(o)
}

/*
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
*/

class App extends Component {
  render() {
    return (
      <div>
        <h1>Feat</h1>
      </div>
    )
  }
}

window.addEventListener('load', () => {
  ReactDOM.render(<App />, document.getElementById('app'))
})


console.log('test!')
