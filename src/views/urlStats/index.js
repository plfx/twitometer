const { DataViewBase } = require('../base')

class UrlStatsView extends DataViewBase {
  constructor(options = {}) {
    super('urlStats')

    const optionsDefaults = {
      maxRanks: 5
    }
    this.options = Object.assign({}, optionsDefaults, options)
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

    const domainsByCount = Object.entries(aggregateData.domains).reduce(
      (topDomains, [domain, count]) => {
        for(let i = 0; i < this.options.maxRanks; i++) {
          if(!topDomains[i] || count > topDomains[i].count) {
            topDomains.splice(i, 0, { domain, count })
            topDomains.splice(this.options.maxRanks, 1)
            break
          }
        }
        return topDomains
      },
      []
    )

    return {
      count: aggregateData.count,
      countWithUrls: aggregateData.countWithUrls,
      urlRatio,
      domains: domainsByCount
    }
  }
}

module.exports = { UrlStatsView }
