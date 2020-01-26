const { DataViewBase } = require('../base')

class TweetCountView extends DataViewBase {
  constructor() {
    super('tweetCount')
  }

  createSample(sampleStartSeconds, sampleSizeSeconds) {
    return {
      count: 0,
      sampleSizeSeconds
    }
  }

  processTweet(tweet, sampleData) {
    sampleData.count++
  }

  aggregateSamples(sampleIterator) {
    const aggregateData = {
      count: 0,
      timeSpanSeconds: 0
    }

    for(const sampleData of sampleIterator) {
      aggregateData.count += sampleData.count
      aggregateData.timeSpanSeconds += sampleData.sampleSizeSeconds
    }
    return aggregateData
  }

  generateReport(aggregateData) {
    return {
      avgTweetsPerHour: aggregateData.count * 3600 / aggregateData.timeSpanSeconds
    }
  }
}

module.exports = { TweetCountView }
