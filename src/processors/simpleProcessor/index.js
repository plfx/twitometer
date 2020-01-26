const { DataViewBase } = require('../../views/base')

class SimpleProcessor {
  constructor(views, options = {}) {
    const optionsDefaults = {
      getCurrentTimeSeconds: () => Math.floor(Date.now() / 1000)
    }
    this.options = Object.assign({}, optionsDefaults, options)

    this.views = views
    this.data = {}
    this.views.forEach((view) => {
      if(!view instanceof DataViewBase) {
        throw new Error(`Type [${view && view.constructor.name}] is not a data view.`)
      }

      const viewName = view.getName()
      this.data[viewName] = view.createSample(this.options.getCurrentTimeSeconds(), Infinity)
    })

    this.elapsedTweets = 0
  }

  handle(tweet) {
    this.elapsedTweets++
    this.views.forEach((view) => {
      const viewName = view.getName()
      const viewSampleData = this.data[viewName]
      view.processTweet(tweet, viewSampleData)
    })
  }

  report() {
    const report = {
      elapsedTweets: this.elapsedTweets
    }

    this.views.forEach((view) => {
      const viewName = view.getName()
      report[viewName] = view.generateReport(view.aggregateData([this.data[viewName]]))
    })

    return report
  }
}
