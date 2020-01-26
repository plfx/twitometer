const EventEmitter = require('events')
const samples = require('./sample.json')

async function getFakeStream(tweetCount = 200) {
  if(tweetCount > samples.length) {
    throw new Error(`The specified tweet count (${tweetCount}) for is too large. The tweet count must be no more than 200.`)
  }

  const stream = new EventEmitter()

  stream._destroyed = false
  stream.destroy = function destroy() {
    stream.removeAllListeners()
    stream._destroyed = true
  }

  stream.emit('connect')

  let sampleIndex = 0
  function pushSample() {
    if(!stream.destroyed) {
      if(sampleIndex < tweetCount) {
        stream.emit('data', samples[sampleIndex])
        sampleIndex++
        setImmediate(pushSample)
      } else {
        stream.emit('disconnect')
      }
    }
  }
  setImmediate(pushSample)

  return stream
}

module.exports = {
  getFakeStream
}
