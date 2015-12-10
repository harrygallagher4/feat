/* 
 * This entire project uses ES2015 syntax. 
 * Run with `babel-node app` or `npm start`
 */
import { api_key } from './config'
import EchoNest from './lib/echonest'

var nest = new EchoNest(api_key)

nest.makeRequest('artist/search', {
  name: 'schoolboy q',
  bucket: 'id:spotify',
  results: '1',
  limit: true
}, (error, response, body) => {
  if (error)
    return console.log(error)
  return console.log(JSON.stringify(body, null, 2))
})
