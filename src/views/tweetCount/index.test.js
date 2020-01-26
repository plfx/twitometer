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
        sampleSizeSeconds: 1
      }

      this.view.processTweet({}, this.sampleData)
    })

    it('updates the sample data', function() {
      assert.deepEqual(this.sampleData, {
        count: 101,
        sampleSizeSeconds: 1
      })
    })
  })

  describe('aggregateSamples', function() {
    before(function() {
      this.aggregated = this.view.aggregateSamples([
        {
          count: 50,
          sampleSizeSeconds: 1
        },
        {
          count: 10,
          sampleSizeSeconds: 1
        },
        {
          count: 40,
          sampleSizeSeconds: 1
        }
      ])
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
        avgTweetsPerHour: 120000
      })
    })
  })
})
