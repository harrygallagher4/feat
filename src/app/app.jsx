import _ from 'lodash'
import Q from 'q'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Grid, Row, Col, Input, Button } from 'react-bootstrap'
import querystring from 'querystring'
import vis from 'vis'

import Spotify from './lib/spotify'

const COLORS = {
  primaryColorDark:   '#FFA000',
  primaryColor:       '#FFC107',
  primaryColorLight:  '#FFECB3',
  primaryColorText:   '#FFFFFF',
  accentColor:        '#607D8B',
  primaryTextColor:   '#212121',
  secondaryTextColor: '#727272',
  dividerColor:       '#B6B6B6'
}

const test_artists = 'action bronson, yelawolf, asap ferg, asap rocky, danny brown, joey badass, schoolboy q, juicy j, lil wayne, future, kendrick lamar, 2 chainz, drake, jay rock, bj the chicago kid, tyler the creator, ab soul, black hippy, snoop dogg, dr dre, jay z, kanye west, pusha t'

window.query = querystring.parse(window.location.hash.substring(1))
window.location.hash = ''
let spotifyReady = false
let spotify

/* Access token handling */
/* ===================== */
let accessToken = window.query.access_token || localStorage.spotifyAccessToken

if (accessToken) {
  if (!localStorage.spotifyAccessToken) {
    localStorage.spotifyAccessToken = window.query.access_token
    localStorage.spotifyExpiresAt = ((Date.now() - 15000) + (window.query.expires_in * 1000))
    localStorage.spotifyRefreshToken = window.query.refresh_token
    localStorage.spotifyTokenType = window.query.token_type
  } else {
    if (localStorage.spotifyExpiresAt - Date.now() <= 0) {
      ['AccessToken', 'ExpiresAt', 'RefreshToken', 'TokenType']
      .forEach(key => localStorage.removeItem(`spotify${key}`))
      accessToken = undefined
    }
  }

  if (accessToken)
    spotify = new Spotify(accessToken, 'US')
}
/* ========================= */
/* End access token handling */

const App = React.createClass({
  componentDidMount() {
    if (this.props.spotify) {
      this.props.spotify.me()
      .then(me => {
        let username =
          this.props.spotify.user.display_name ||
            this.props.spotify.user.id
        this.setState({username})
      })
    }
  },

  getInitialState() {
    let accessToken = localStorage.spotifyAccessToken
    return {
      authenticated: !!accessToken,
      accessToken,
      configHidden: false,
      username: undefined
    }
  },

  getDefaultProps() {
    return {
      spotify: undefined
    }
  },

  build() {
    this.setState({configHidden:true})

    let spot = this.props.spotify

    function getArtistFeatures(artist) {
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

    let artists = _(this.refs.artists.getValue())
    .split(',')
    .map(_.trim)
    .value()

    let artistInfo = Q.all(artists.map(getArtistFeatures))
    Q.allSettled(artistInfo)
    .then(info => {
      info = _(info)
      .pluck('value')
      .value()

      let count = 0
      let artistNodes = _(info)
      .map(info => {
        return {
          id: ++count,
          label: info.name
        }
      })
      .value()

      let artists = _(info)
      .pluck('name')
      .value()

      let edges = _(info)
      .map(artist => {
        let name = artist.name
        let id = _(artistNodes).find({label:name}).id

        return _(artist.features)
        .intersection(artists)
        .map(feature => {
          return {
            from: id,
            to: _(artistNodes)
            .find({label:feature})
            .id,
            dashes: true,
            color: COLORS.primaryColorLight
          }
        })
        .value()
      })
      .flatten()
      .value()

      let cleanedEdges = []
      edges.forEach(edge => {
        let { to, from } = edge
        let sibling = _.find(edges, {to:from, from:to})
        if (sibling) {
          if (!(_.find(cleanedEdges, {to:from, from:to}) || _.find(cleanedEdges, {to, from})))
            cleanedEdges.push({
              to, from,
              dashes: false,
              color: COLORS.primaryColorLight
            })
        } else {
          cleanedEdges.push(edge)
        }
      })

      let visNodes = new vis.DataSet(artistNodes)
      let visEdges = new vis.DataSet(cleanedEdges)
      let container = ReactDOM.findDOMNode(this.refs.network)
      let data = {
        nodes: visNodes,
        edges: visEdges
      }
      let options = {
        configure: {
          filter: function (option, path) {
            if (path.indexOf('physics') !== -1) {
              return true;
            }
            if (path.indexOf('smooth') !== -1 || option === 'smooth') {
              return true;
            }
            return false;
          },
          enabled: false,
          container: ReactDOM.findDOMNode(this.refs.config)
        },
        nodes: {
          shape: 'circle',
          color: {
            border: COLORS.primaryColorDark,
            background: COLORS.primaryColor,
            highlight: {
              border: COLORS.primaryColor,
              background: COLORS.primaryColorLight
            },
            hover: {
              border: COLORS.primaryColor,
              background: COLORS.primaryColorLight
            }
          },
          font: {
            color: 'white',
            face: 'Helvetica'
          },
          shapeProperties: {
            borderRadius: 2
          }
        },
        edges: {
          smooth: {
            type: 'continuous',
            forceDirection: 'none'
          },
          hoverWidth: 2,
          selectionWidth: 2
        },
        interaction: {
          hover: false
        },
        physics: {
          repulsion: {
            centralGravity: 0.25,
            springLength: 0,
            springConstant: 0,
            nodeDistance: 80,
            damping: 0.09
          },
          barnesHut: {
            gravitationalConstant: -11150,
            centralGravity: 4.1,
            springLength: 500,
            springConstant: 0.03,
            damping: 0.5,
            avoidOverlap: 0.2
          },
          stabilization: false,
          solver: 'repulsion',
          timestep: 0.5,
          minVelocity: 0.01
        }
      }
      let network = new vis.Network(container, data, options)
    })
    .done()
  },

  render() {
    return (
      <Grid>
        <div id='network' ref='network'></div>
        <div id='config' ref='config'></div>
        <Row hidden={this.state.configHidden}>
          <Col xs={4}>
            <h2>Config</h2>
            <form>
              <Input
                type='text'
                label='Spotify Username'
                value={this.state.username}
                disabled
              />
              <Button href='/auth' block bsStyle='success' disabled={this.state.authenticated}>Link Spotify</Button>
              <Input
                type='text'
                label='Artists'
                defaultValue={test_artists}
                placeholder='A$AP Rocky, Drake, ScHoolBoy Q, ...'
                ref='artists'
              />
              <Button
                block
                onClick={this.build}
                disabled={!this.state.authenticated}
                >Build Web</Button>
            </form>
          </Col>
        </Row>
      </Grid>
    )
  }
})

window.addEventListener('load', () => {
  ReactDOM.render(<App spotify={spotify} />, document.getElementById('app'))
})

