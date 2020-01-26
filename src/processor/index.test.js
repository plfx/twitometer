const assert = require('assert')

const { getFakeStream } = require('../streams/fake')
const { TweetCountView } = require('../views/tweetCount')
const { WindowingProcessor } = require('./')

describe('tweetCount', function() {
  describe('streaming 50 tweets', () => {
    before(async function() {
      this.processor = new WindowingProcessor(
        [ new TweetCountView() ],
        {
          dataWindowSizeSeconds: 10,
          dataWindowResolution: 1,
          dawnOfTime: 1579980324,
          getCurrentTimeSeconds: () => 1579980334
        }
      )
      this.stream = await getFakeStream(50)
      this.stream.on('data', (tweet) => this.processor.handle(tweet))

      // await end of fake stream
      await new Promise((resolve) => this.stream.on('disconnect', resolve))
    })

    it('should count 50 tweets', async function() {
      const report = await this.processor.report()
      assert.equal(report.tweetCount.total, 50)
    })
  })
})
