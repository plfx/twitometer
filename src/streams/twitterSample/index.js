const Twitter = require('twitter')
const apiCreds = require('../../../creds.json')

var client = new Twitter(apiCreds)

async function getStream() {
  return new Promise((resolve) => {
    client.stream('statuses/sample', (stream) => {
      stream.on('disconnect', () => stream.destroy())
      resolve(stream)
    })
  })
}

module.exports = {
  getStream
}
