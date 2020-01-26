const assert = require('assert')

const { UrlStatsView } = require('./')

describe('UrlStatsView', function() {
  before(function() {
    this.view = new UrlStatsView()
  })

  describe('processTweet', function() {
    before(function() {
      this.sampleData = {
        count: 100,
        countWithUrls: 20,
        domains: {
          'domain0': 1,
          'domain1': 3
        }
      }

      this.view.processTweet({
        entities: {
          urls: [
            {
              "expanded_url": "https://DOMAIN0/a/b/c/d"
            },
            {
              "expanded_url": "wss://domain1/e/f/g/h"
            },
            {
              "expanded_url": "http://Domain2/etc"
            }
          ]
        }
      }, this.sampleData)
    })

    it('updates the sample data', function() {
      assert.deepEqual(this.sampleData, {
        count: 101,
        countWithUrls: 21,
        domains: {
          'domain0': 2,
          'domain1': 4,
          'domain2': 1
        }
      })
    })
  })

  describe('aggregateSamples', function() {
    before(function() {
      this.aggregated = this.view.aggregateSamples([
        {
          count: 5,
          countWithUrls: 1,
          domains: {
            'domain1': 1
          }
        },
        {
          count: 10,
          countWithUrls: 4,
          domains: {
            'domain0': 1,
            'domain1': 3
          }
        },
        {
          count: 5,
          countWithUrls: 5,
          domains: {
            'domain0': 3,
            'domain1': 2
          }
        }
      ])
    })

    it('sums correctly', function() {
      assert.deepEqual(this.aggregated, {
        count: 20,
        countWithUrls: 10,
        domains: {
          'domain0': 4,
          'domain1': 6
        }
      })
    })
  })

  describe('generateReport', function() {
    before(function() {
      this.report = this.view.generateReport({
        count: 100,
        countWithUrls: 10,
        domains: {
          'domain0.com': 4,
          'domain1.com': 1,
          'domain2.com': 3,
          'domain3.com': 2
        }
      })
    })

    it('generates correct stats', function() {
      assert.deepEqual(this.report, {
        count: 100,
        countWithUrls: 10,
        urlRatio: 0.1,
        domains: [
          { domain: 'domain0.com', count: 4 },
          { domain: 'domain2.com', count: 3 },
          { domain: 'domain3.com', count: 2 },
          { domain: 'domain1.com', count: 1 }
        ]
      })
    })
  })
})
