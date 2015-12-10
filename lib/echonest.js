import http from 'http'
import querystring from 'querystring'
import _ from 'lodash'

class EchoNest {
  constructor(api_key) {
    this.api_key = api_key
    this.url = 'http://developer.echonest.com'
  }

  makeRequest(endpoint, params, callback) {
    params = querystring.encode(_.assign({api_key: this.api_key}, params))
    let path = `${this.url}/api/v4/${endpoint}?${params}`

    http.get(path, res => {
      let body = '';
      res.on('data', data => { body += data })
      res.on('end', () => { callback(null, res, JSON.parse(body)) })
    })
    .on('error', e => { callback(e, null, null) })

  }
}

export default EchoNest
