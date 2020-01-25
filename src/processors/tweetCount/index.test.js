const assert = require('assert')

const { getFakeStream } = require('../../streams/fake')
const TweetCountProcessor = require('./')

describe('tweetCount', function() {
  before(async function() {
    this.processor = new TweetCountProcessor()
    this.stream = await getFakeStream(50)
    this.stream.on('data', (tweet) => this.processor.handle(tweet))
  })

  it('should return the count of tweets', async function() {

    // await end of fake stream
    await new Promise((resolve) => this.stream.on('disconnect', resolve))
    const report = await this.processor.report()
    assert.equal(report.total, 50)
  })
})
