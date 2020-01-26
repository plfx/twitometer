const assert = require('assert')

const { TweetCountView } = require('./')

describe('TweetCountView', function() {
  before(function() {
    this.view = new TweetCountView()
  })

  describe('processTweet', function() {
    before(function() {
      this.sampleData = {
        count: 100
      }

      this.view.processTweet({}, this.sampleData)
    })

    it('updates the sample data', function() {
      assert.deepEqual(this.sampleData, {
        count: 101
      })
    })
  })

  describe('aggregateSamples', function() {
    before(function() {
      this.aggregated = this.view.aggregateSamples([
        {
          count: 5
        },
        {
          count: 10
        },
        {
          count: 5
        }
      ])
    })

    it('sums correctly', function() {
      assert.deepEqual(this.aggregated, {
        total: 20
      })
    })
  })

  describe('generateReport', function() {
    before(function() {
      this.report = this.view.generateReport({
        total: 100
      })
    })

    it('generates correct stats', function() {
      assert.deepEqual(this.report, {
        total: 100
      })
    })
  })
})
