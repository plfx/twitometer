const assert = require('assert')

const { TweetCountView } = require('./')

describe('TweetCountView', function() {
  before(function() {
    this.view = new TweetCountView()
  })

  describe('processTweet', function() {
    before(function() {
      this.sampleData = {
        count: 100,
        sampleStartSeconds: 1000000000,
        sampleSizeSeconds: 1
      }

      this.view.processTweet({}, this.sampleData)
    })

    it('updates the sample data', function() {
      assert.deepEqual(this.sampleData, {
        count: 101,
        sampleStartSeconds: 1000000000,
        sampleSizeSeconds: 1
      })
    })
  })

  describe('aggregateSamples', function() {
    before(function() {
      this.aggregated = this.view.aggregateSamples([
        {
          count: 50,
          sampleStartSeconds: 1000000000,
          sampleSizeSeconds: 1
        },
        {
          count: 10,
          sampleStartSeconds: 1000000001,
          sampleSizeSeconds: 1
        },
        {
          count: 40,
          sampleStartSeconds: 1000000002,
          sampleSizeSeconds: 1
        }
      ], 1000000003)
    })

    it('sums correctly', function() {
      assert.deepEqual(this.aggregated, {
        count: 100,
        timeSpanSeconds: 3
      })
    })
  })

  describe('generateReport', function() {
    before(function() {
      this.report = this.view.generateReport({
        count: 100,
        timeSpanSeconds: 3
      })
    })

    it('generates correct stats', function() {
      assert.deepEqual(this.report, {
        count: 100,
        avgTweetsPerHour: 120000
      })
    })
  })
})
