const { DataViewBase } = require('../base')

class UrlStatsView extends DataViewBase {
  constructor() {
    super('urlStats')
  }

  createSample() {
    return {
      count: 0,
      countWithUrls: 0,
      domains: {}
    }
  }

  processTweet(tweet, sampleData) {
    sampleData.count++
    if(tweet.entities.urls.length > 0) {
      sampleData.countWithUrls++
      tweet.entities.urls.forEach((urlData) => {
        const url = new URL(urlData.expanded_url)
        const domain = url.hostname.toLowerCase()
        if(sampleData.domains[domain]) {
          sampleData.domains[domain]++
        } else {
          sampleData.domains[domain] = 1
        }
      })
    }
  }

  aggregateSamples(sampleIterator) {
    const aggregateData = {
      count: 0,
      countWithUrls: 0,
      domains: {}
    }

    for(const sampleData of sampleIterator) {
      aggregateData.count += sampleData.count
      aggregateData.countWithUrls += sampleData.countWithUrls
      Object.entries(sampleData.domains).forEach(([domain, count]) => {
        if(aggregateData.domains[domain]) {
          aggregateData.domains[domain] += count
        } else {
          aggregateData.domains[domain] = count
        }
      })
    }

    return aggregateData
  }

  generateReport(aggregateData) {
    const urlRatio = (aggregateData.countWithUrls) && (aggregateData.countWithUrls / aggregateData.count)

    const domainsSorted = Object.entries(aggregateData.domains).map(([domain, count]) => ({
      domain,
      count
    }))
    domainsSorted.sort((domainA, domainB) => domainB.count - domainA.count)

    return {
      count: aggregateData.count,
      countWithUrls: aggregateData.countWithUrls,
      urlRatio,
      domains: domainsSorted
    }
  }
}

module.exports = { UrlStatsView }
