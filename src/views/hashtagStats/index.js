const { DataViewBase } = require('../base')

class HashtagStatsView extends WindowingProcessorBase {
  constructor() {
    super('hashtagStats')
  }

  createSample() {
    return {
      count: 0,
      countWithHashtags: 0,
      hashtags: {}
    }
  }

  processTweet(tweet, sampleData) {
    sampleData.count++
    if(tweet.entities.hashtags.length > 0) {
      sampleData.countWithHashtags++
      tweet.entities.hashtags.forEach((hashtagData) => {
        // hashtags are not case sensitive, so normalize to lower case
        const hashtag = hashtagData.text.toLowerCase()
        if(sampleData.hashtags[hashtag]) {
          sampleData.hashtags[hashtag]++
        } else {
          sampleData.hashtags[hashtag] = 1
        }
      })
    }
  }

  aggregateSamples(sampleIterator) {
    const aggregateData = {
      count: 0,
      countWithHashtags: 0,
      hashtags: {}
    }

    for(const sampleData of sampleIterator) {
      aggregateData.count += sampleData.count
      aggregateData.countWithHashtags += sampleData.countWithHashtags
      Object.entries(sampleData.hashtags).forEach(([hashtag, count]) => {
        if(aggregateData.hashtags[hashtag]) {
          aggregateData.hashtags[hashtag] += count
        } else {
          aggregateData.hashtags[hashtag] = count
        }
      })
    }

    return aggregateData
  }

  generateReport(aggregateData) {
    const hashtagsByCount = Object.entries(aggregateData.hashtags).map(([hashtag, count]) => ({
      hashtag,
      count
    }))
    hashtagsByCount.sort((hashtagA, hashtagB) => hashtagB.count - hashtagA.count)

    return {
      count: aggregateData.count,
      countWithHashtags: aggregateData.countWithHashtags,
      hashtagsByCount
    }
  }
}

module.exports = HashtagStatsView
