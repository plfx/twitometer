const { DataViewBase } = require('../base')

class TweetCountView extends DataViewBase {
  constructor() {
    super('tweetCount')
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
    return aggregateData
  }
}

module.exports = { TweetCountView }
