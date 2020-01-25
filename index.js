const Twitter = require('twitter')
const apiCreds = require('./creds.json')

var client = new Twitter(apiCreds)

async function getStream() {
  return new Promise((resolve) => {
    client.stream('statuses/sample', (stream) => resolve(stream))
  })
}

async function analyze() {
  const stream = await getStream()
  stream.on('data', function(tweet) {
    console.log(tweet.text)
  })

  stream.on('error', function(error) {
    console.log(error)
  })
}

analyze()
