require('babel-polyfill')
require('babel-register')({
  only: /src\//
})
var app = require('./src/api/api').default
var config = require('./src/api/config')

app.listen(config.port)
