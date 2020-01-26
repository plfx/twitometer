const assert = require('assert')

const { getFakeStream } = require('../../streams/fake')
const TweetCountProcessor = require('./')

describe('tweetCount', function() {
  describe('streaming 50 tweets', () => {
    before(async function() {
      this.processor = new TweetCountProcessor({
        dataWindowSizeSeconds: 10,
        dataWindowResolution: 1,
        dawnOfTime: 1579980324,
        getCurrentTimeSeconds: () => 1579980334
      })
      this.stream = await getFakeStream(50)
      this.stream.on('data', (tweet) => this.processor.handle(tweet))

      // await end of fake stream
      await new Promise((resolve) => this.stream.on('disconnect', resolve))
    })

    it('should count 50 tweets', async function() {
      const report = await this.processor.report()
      assert.equal(report.total, 50)
    })
  })

  describe('streaming 200 tweets', () => {
    before(async function() {
      this.processor = new TweetCountProcessor({
        dataWindowSizeSeconds: 10,
        dataWindowResolution: 1,
        dawnOfTime: 1579980324,
        getCurrentTimeSeconds: () => 1579980334
      })
      this.stream = await getFakeStream(200)
      this.stream.on('data', (tweet) => this.processor.handle(tweet))

      // await end of fake stream
      await new Promise((resolve) => this.stream.on('disconnect', resolve))
    })

    it('should count 200 tweets', async function() {
      const report = await this.processor.report()
      assert.equal(report.total, 200)
    })
  })
})
