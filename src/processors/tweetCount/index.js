const { WindowingProcessorBase } = require('../processor')

class UrlStatsProcessor extends WindowingProcessorBase {
  constructor(options = {}) {
    super('tweetCount', options)
  }

  createSample() {
    return {
      count: 0
    }
  }

  processTweet(tweet, sampleData) {
    sampleData.count++
  }

  aggregateSamples(sampleIterator) {
    const aggregateData = {
      total: 0
    }

    for(const sampleData of sampleIterator) {
      aggregateData.total += sampleData.count
    }
    return aggregateData
  }

  generateReport(aggregateData) {
    return Object.assign({}, aggregateData)
  }
}

module.exports = UrlStatsProcessor
