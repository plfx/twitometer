const { DataViewBase } = require('../base')

class PhotoStatsView extends DataViewBase {
  constructor() {
    super('photoStats')
  }

  createSample() {
    return {
      count: 0,
      countWithPhotos: 0
    }
  }

  processTweet(tweet, sampleData) {
    sampleData.count++
    if(tweet.entities.media && tweet.entities.media.length > 0) {
      if(tweet.entities.media.some((m) => m.type === 'photo')) {
        sampleData.countWithPhotos++
      }
    }
  }

  aggregateSamples(sampleIterator) {
    const aggregateData = {
      count: 0,
      countWithPhotos: 0
    }

    for(const sampleData of sampleIterator) {
      aggregateData.count += sampleData.count
      aggregateData.countWithPhotos += sampleData.countWithPhotos
    }

    return aggregateData
  }

  generateReport(aggregateData) {
    const photoRatio = (aggregateData.countWithPhotos) && (aggregateData.countWithPhotos / aggregateData.count)

    return {
      countWithPhotos: aggregateData.countWithPhotos,
      photoRatio
    }
  }
}

module.exports = { PhotoStatsView }
