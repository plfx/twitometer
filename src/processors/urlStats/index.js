class UrlStatsProcessor {
  constructor(options = {}) {
    const optionsDefaults = {
      dataWindowSizeSeconds: 24 * 60 * 60 * 1000, // 1 day
      dataWindowResolution: 400,
      getCurrentTimeSeconds: () => Date.now(),
      dawnOfTime: options.getCurrentTimeSeconds ? options.getCurrentTimeSeconds() : Math.floor(Date.now()/1000)
    }
    this.options = Object.assign({}, optionsDefaults, options)
    if(this.options.dataWindowSizeSeconds % this.options.dataWindowResolution) {
      throw new Error('Invalid options: dataWindowSizeSeconds must be divisble by dataWindowResolution.')
    }

    this.data = {
      dataSamples: []
    }
  }

  async handle(tweet) {
    const timestampSeconds = Math.floor(new Date(tweet.created_at).valueOf()/1000) - this.options.dawnOfTime

    const windowStartSeconds = (this.options.getCurrentTimeSeconds() - this.options.dawnOfTime) - this.options.dataWindowSizeSeconds
    if(timestampSeconds < windowStartSeconds) {
      // this tweet was created before the sample window, so it is ignored
      return
    }

    const sampleSizeSeconds = this.options.dataWindowSizeSeconds / this.options.dataWindowResolution
    const sampleStartSeconds = timestampSeconds - (timestampSeconds % sampleSizeSeconds)
    const sampleData = this.data.dataSamples[sampleStartSeconds.toString()] || (
      this.data.dataSamples[sampleStartSeconds.toString()] = {
        count: 0,
        countWithUrls: 0,
        domains: {}
      }
    )

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

  async report() {
    const sampleSizeSeconds = this.options.dataWindowSizeSeconds / this.options.dataWindowResolution
    const nowSeconds = (this.options.getCurrentTimeSeconds() - this.options.dawnOfTime)
    const currentSampleStartSeconds = nowSeconds - (nowSeconds % sampleSizeSeconds)
    const windowStartSeconds = nowSeconds - this.options.dataWindowSizeSeconds

    const aggregateData = {
      count: 0,
      countWithUrls: 0,
      domains: {}
    }

    for(let t = currentSampleStartSeconds; t >= windowStartSeconds; t -= sampleSizeSeconds) {
      const sampleData = this.data.dataSamples[t.toString()]
      if(!sampleData) {
        continue
      }
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

    const urlRatio = (aggregateData.countWithUrls) && (aggregateData.countWithUrls / aggregateData.count)

    const domainsSorted = Object.entries(aggregateData.domains).map(([domain, count]) => ({
      domain,
      count
    }))
    domainsSorted.sort((domainA, domainB) => domainB.count - domainA.count)

    return {
      count: aggregateData.count,
      countWithUrls: aggregateData.count,
      urlRatio,
      domains: domainsSorted
    }
  }
}

module.exports = UrlStatsProcessor
