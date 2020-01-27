const { DataViewBase } = require('../base')

class HashtagStatsView extends DataViewBase {
  constructor(options = {}) {
    super('hashtagStats')

    const optionsDefaults = {
      maxRanks: 5
    }
    this.options = Object.assign({}, optionsDefaults, options)
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
    const hashtagsByCount = Object.entries(aggregateData.hashtags).reduce(
      (topHashtags, [hashtag, count]) => {
        for(let i = 0; i < this.options.maxRanks; i++) {
          if(!topHashtags[i] || count > topHashtags[i].count) {
            topHashtags.splice(i, 0, { hashtag, count })
            topHashtags.splice(this.options.maxRanks, 1)
            break
          }
        }
        return topHashtags
      },
      []
    )

    return {
      count: aggregateData.count,
      countWithHashtags: aggregateData.countWithHashtags,
      hashtagsByCount
    }
  }
}

module.exports = { HashtagStatsView }
