const { DataViewBase } = require('../base')
const emojiRegex = require('emoji-regex')()

class EmojiStatsView extends DataViewBase {
  constructor() {
    super('emojiStats')
  }

  createSample() {
    return {
      count: 0,
      countWithEmoji: 0,
      emoji: {}
    }
  }

  processTweet(tweet, sampleData) {
    sampleData.count++
    const tweetEmojis = new Set()
    let match
    while(match = emojiRegex.exec(tweet.text)) {
      tweetEmojis.add(match[0])
    }
    if(tweetEmojis.size > 0) {
      sampleData.countWithEmoji++
      tweetEmojis.forEach((e) => {
        if(sampleData.emoji[e]) {
          sampleData.emoji[e]++
        } else {
          sampleData.emoji[e] = 1
        }
      })
    }
  }

  aggregateSamples(sampleIterator) {
    const aggregateData = {
      count: 0,
      countWithEmoji: 0,
      emoji: {}
    }

    for(const sampleData of sampleIterator) {
      aggregateData.count += sampleData.count
      aggregateData.countWithEmoji += sampleData.countWithEmoji
      Object.entries(sampleData.emoji).forEach(([emoji, count]) => {
        if(aggregateData.emoji[emoji]) {
          aggregateData.emoji[emoji] += count
        } else {
          aggregateData.emoji[emoji] = count
        }
      })
    }

    return aggregateData
  }

  generateReport(aggregateData) {
    const emojiByCount = Object.entries(aggregateData.emoji).map(([emoji, count]) => ({
      emoji,
      count
    }))
    emojiByCount.sort((emojiA, emojiB) => emojiB.count - emojiA.count)

    return {
      count: aggregateData.count,
      countWithEmoji: aggregateData.countWithEmoji,
      emojiByCount
    }
  }
}

module.exports = { EmojiStatsView }
