const assert = require('assert')

const { PhotoStatsView } = require('./')

describe('PhotoStatsView', function() {
  before(function() {
    this.view = new PhotoStatsView()
  })

  describe('processTweet', function() {
    before(function() {
      this.sampleData = {
        count: 100,
        countWithPhotos: 20
      }

      this.view.processTweet({
        entities: {
          media: [
            {
              "type": "photo"
            }
          ]
        }
      }, this.sampleData)
    })

    it('updates the sample data', function() {
      assert.deepEqual(this.sampleData, {
        count: 101,
        countWithPhotos: 21
      })
    })
  })

  describe('aggregateSamples', function() {
    before(function() {
      this.aggregated = this.view.aggregateSamples([
        {
          count: 5,
          countWithPhotos: 1
        },
        {
          count: 10,
          countWithPhotos: 4
        },
        {
          count: 5,
          countWithPhotos: 5
        }
      ])
    })

    it('sums correctly', function() {
      assert.deepEqual(this.aggregated, {
        count: 20,
        countWithPhotos: 10
      })
    })
  })

  describe('generateReport', function() {
    before(function() {
      this.report = this.view.generateReport({
        count: 100,
        countWithPhotos: 10
      })
    })

    it('generates correct stats', function() {
      assert.deepEqual(this.report, {
        count: 100,
        countWithPhotos: 10,
        photoRatio: 0.1
      })
    })
  })
})
