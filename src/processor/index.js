const { DataViewBase } = require('../views/base')

class WindowingProcessor {
  constructor(views, options = {}) {
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

    this.views = views
    this.views.forEach((view) => {
      if(!view instanceof DataViewBase) {
        throw new Error(`Type [${view && view.constructor.name}] is not a data view.`)
      }
    })

    this.dataSamples = []
  }

  handle(tweet) {
    const timestampSeconds = Math.floor(new Date(tweet.created_at).valueOf()/1000) - this.options.dawnOfTime

    const windowStartSeconds = (this.options.getCurrentTimeSeconds() - this.options.dawnOfTime) - this.options.dataWindowSizeSeconds
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
        sampleData[viewName] = view.createSample()
      })
      this.dataSamples[sampleStartSeconds.toString()] = sampleData
    }

    this.views.forEach(async (view) => {
      const viewName = view.getName()
      const viewSampleData = sampleData[viewName]
      await view.processTweet(tweet, viewSampleData)
    })
  }

  async report() {
    const sampleSizeSeconds = this.options.dataWindowSizeSeconds / this.options.dataWindowResolution
    const nowSeconds = (this.options.getCurrentTimeSeconds() - this.options.dawnOfTime)
    const currentSampleStartSeconds = nowSeconds - (nowSeconds % sampleSizeSeconds)
    const windowStartSeconds = nowSeconds - this.options.dataWindowSizeSeconds

    const report = {}

    this.views.forEach((view) => {
      const viewName = view.getName()
      function * yieldSamples(dataSamples) {
        for(let t = currentSampleStartSeconds; t >= windowStartSeconds; t -= sampleSizeSeconds) {
          const sampleData = dataSamples[t.toString()] || {}
          const viewSampleData = sampleData[viewName] || view.createSample()
          yield viewSampleData
        }
      }
      const aggregateData = view.aggregateSamples(yieldSamples(this.dataSamples))
      report[viewName] = view.generateReport(aggregateData)
    })

    return report
  }
}
module.exports = { WindowingProcessor }
