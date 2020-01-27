const { DataViewBase } = require('../../views/base')

class WindowedProcessor {
  constructor(views, options = {}) {
    const optionsDefaults = {
      dataWindowSizeSeconds: 24 * 60 * 60, // 1 day
      dataWindowResolution: 400,
      getCurrentTimeSeconds: () => Math.floor(Date.now() / 1000),
      dawnOfTime: options.getCurrentTimeSeconds ? options.getCurrentTimeSeconds() : Math.floor(Date.now() / 1000)
    }
    this.options = Object.assign({}, optionsDefaults, options)
    if(this.options.dataWindowSizeSeconds % this.options.dataWindowResolution) {
      throw new Error('Invalid options: dataWindowSizeSeconds must be divisble by dataWindowResolution.')
    }

    this.views = views
    this.views.forEach((view) => {
      if(!view instanceof DataViewBase) {
        throw new Error(`Type [${view && view.constructor.name}] is not a data view.`)
      }
    })

    this.dataSamples = []
    this.elapsedTweets = 0
  }

  handle(tweet) {
    this.elapsedTweets++
    const timestampSeconds = Math.floor(new Date(tweet.created_at).valueOf() / 1000) - this.options.dawnOfTime

    const currentTimeSeconds = this.options.getCurrentTimeSeconds() - this.options.dawnOfTime
    const windowStartSeconds = currentTimeSeconds - this.options.dataWindowSizeSeconds
    if(timestampSeconds < windowStartSeconds) {
      // this tweet was created before the sample window, so it is ignored
      return
    }

    const sampleSizeSeconds = this.options.dataWindowSizeSeconds / this.options.dataWindowResolution
    const sampleStartSeconds = timestampSeconds - (timestampSeconds % sampleSizeSeconds)
    let sampleData = this.dataSamples[sampleStartSeconds.toString()]
    if (!sampleData) {
      sampleData = {}
      this.views.forEach((view) => {
        const viewName = view.getName()
        sampleData[viewName] = view.createSample(sampleStartSeconds, sampleSizeSeconds)
      })
      this.dataSamples[sampleStartSeconds.toString()] = sampleData
      setTimeout(() => {
        delete this.dataSamples[sampleStartSeconds.toString()]
      }, (this.options.dataWindowSizeSeconds + sampleSizeSeconds) * 1000)
    }

    this.views.forEach((view) => {
      const viewName = view.getName()
      const viewSampleData = sampleData[viewName]
      view.processTweet(tweet, viewSampleData, currentTimeSeconds)
    })
  }

  async report() {
    const sampleSizeSeconds = this.options.dataWindowSizeSeconds / this.options.dataWindowResolution
    const currentTimeSeconds = this.options.getCurrentTimeSeconds() - this.options.dawnOfTime
    const currentSampleStartSeconds = currentTimeSeconds - (currentTimeSeconds % sampleSizeSeconds)
    const windowStartSeconds = Math.max(0, currentTimeSeconds - this.options.dataWindowSizeSeconds)

    const windowStartSecondsAbsolute = windowStartSeconds + this.options.dawnOfTime
    const windowStartTimeDate = new Date(windowStartSecondsAbsolute * 1000)

    const report = {
      dataStartTime: windowStartTimeDate.toISOString(),
      elapsedTweets: this.elapsedTweets
    }

    this.views.forEach((view) => {
      const viewName = view.getName()
      function * yieldSamples(dataSamples) {
        for(let t = currentSampleStartSeconds; t >= windowStartSeconds; t -= sampleSizeSeconds) {
          const sampleData = dataSamples[t.toString()] || {}
          const viewSampleData = sampleData[viewName] || view.createSample(t, sampleSizeSeconds)
          yield viewSampleData
        }
      }
      const aggregateData = view.aggregateSamples(yieldSamples(this.dataSamples), currentTimeSeconds)
      report[viewName] = view.generateReport(aggregateData, currentTimeSeconds)
    })

    return report
  }
}
module.exports = { WindowedProcessor }
