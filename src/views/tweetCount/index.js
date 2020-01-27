const { DataViewBase } = require('../base')

class TweetCountView extends DataViewBase {
  constructor() {
    super('tweetCount')
  }

  createSample(sampleStartSeconds, sampleSizeSeconds) {
    return {
      count: 0,
      sampleStartSeconds,
      sampleSizeSeconds
    }
  }

  processTweet(tweet, sampleData) {
    sampleData.count++
  }

  aggregateSamples(sampleIterator, currentTimeSeconds) {
    const aggregateData = {
      count: 0,
      timeSpanSeconds: 0
    }

    for(const sampleData of sampleIterator) {
      aggregateData.count += sampleData.count
      // for the final/current sample, only add the amount of time elapsed
      aggregateData.timeSpanSeconds += Math.min(sampleData.sampleSizeSeconds, currentTimeSeconds - sampleData.sampleStartSeconds)
    }
    return aggregateData
  }

  generateReport(aggregateData) {
    return {
      count: aggregateData.count,
      avgTweetsPerHour: aggregateData.count * 3600 / aggregateData.timeSpanSeconds
    }
  }
}

module.exports = { TweetCountView }
