class WindowingProcessorBase {
  constructor(viewName, options) {
    const optionsDefaults = {
      dataWindowSizeSeconds: 24 * 60 * 60 * 1000, // 1 day
      dataWindowResolution: 400,
      getCurrentTimeSeconds: () => Date.now(),
      dawnOfTime: options.getCurrentTimeSeconds ? options.getCurrentTimeSeconds() : Math.floor(Date.now()/1000)
    }
    this.options = Object.assign({}, optionsDefaults, options)
    if(this.options.dataWindowSizeSeconds % this.options.dataWindowResolution) {
      throw new Error('Invalid options: dataWindowSizeSeconds must be divisble by dataWindowResolution.')
    }

    this.dataSamples = []
  }

  async handle(tweet) {
    const timestampSeconds = Math.floor(new Date(tweet.created_at).valueOf()/1000) - this.options.dawnOfTime

    const windowStartSeconds = (this.options.getCurrentTimeSeconds() - this.options.dawnOfTime) - this.options.dataWindowSizeSeconds
    if(timestampSeconds < windowStartSeconds) {
      // this tweet was created before the sample window, so it is ignored
      return
    }

    const sampleSizeSeconds = this.options.dataWindowSizeSeconds / this.options.dataWindowResolution
    const sampleStartSeconds = timestampSeconds - (timestampSeconds % sampleSizeSeconds)
    const sampleData = this.dataSamples[sampleStartSeconds.toString()] || (
      this.dataSamples[sampleStartSeconds.toString()] = this.createSample()
    )

    this.processTweet(tweet, sampleData)
  }

  async report() {
    const sampleSizeSeconds = this.options.dataWindowSizeSeconds / this.options.dataWindowResolution
    const nowSeconds = (this.options.getCurrentTimeSeconds() - this.options.dawnOfTime)
    const currentSampleStartSeconds = nowSeconds - (nowSeconds % sampleSizeSeconds)
    const windowStartSeconds = nowSeconds - this.options.dataWindowSizeSeconds

    function * yieldSamples(processor) {
      for(let t = currentSampleStartSeconds; t >= windowStartSeconds; t -= sampleSizeSeconds) {
        const sampleData = processor.dataSamples[t.toString()] || processor.createSample()
        yield sampleData
      }
    }
    const aggregateData = this.aggregateSamples(yieldSamples(this))

    const report = this.generateReport(aggregateData)
    return report
  }
}
 module.exports = { WindowingProcessorBase }
