const assert = require('assert')

const { getFakeStream } = require('../../streams/fake')
const UrlStatsProcessor = require('./')

describe('urlStats', function() {
  before(async function() {
    this.processor = new UrlStatsProcessor({
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

  it('should return the count of tweets', async function() {
    const report = await this.processor.report()
    console.log(report)
  })
})
