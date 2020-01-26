const assert = require('assert')

const { HashtagStatsView } = require('./')

describe('HashtagStatsView', function() {
  before(function() {
    this.view = new HashtagStatsView()
  })

  describe('processTweet', function() {
    before(function() {
      this.sampleData = {
        count: 100,
        countWithHashtags: 20,
        hashtags: {
          'nevergiveup': 1,
          'neversurrender': 3
        }
      }

      this.view.processTweet({
        entities: {
          hashtags: [
            {
              "text": "NeverGiveUp"
            },
            {
              "text": "NeverSurrender"
            },
            {
              "text": "perseverance"
            }
          ]
        }
      }, this.sampleData)
    })

    it('updates the sample data', function() {
      assert.deepEqual(this.sampleData, {
        count: 101,
        countWithHashtags: 21,
        hashtags: {
          'nevergiveup': 2,
          'neversurrender': 4,
          'perseverance': 1
        }
      })
    })
  })

  describe('aggregateSamples', function() {
    before(function() {
      this.aggregated = this.view.aggregateSamples([
        {
          count: 5,
          countWithHashtags: 1,
          hashtags: {
            'hashtag1': 1
          }
        },
        {
          count: 10,
          countWithHashtags: 4,
          hashtags: {
            'hashtag0': 1,
            'hashtag1': 3
          }
        },
        {
          count: 5,
          countWithHashtags: 5,
          hashtags: {
            'hashtag0': 3,
            'hashtag1': 2
          }
        }
      ])
    })

    it('sums correctly', function() {
      assert.deepEqual(this.aggregated, {
        count: 20,
        countWithHashtags: 10,
        hashtags: {
          'hashtag0': 4,
          'hashtag1': 6
        }
      })
    })
  })

  describe('generateReport', function() {
    before(function() {
      this.report = this.view.generateReport({
        count: 100,
        countWithHashtags: 10,
        hashtags: {
          'hashtag0': 4,
          'hashtag1': 1,
          'hashtag2': 3,
          'hashtag3': 2
        }
      })
    })

    it('generates correct stats', function() {
      assert.deepEqual(this.report, {
        count: 100,
        countWithHashtags: 10,
        hashtagsByCount: [
          { hashtag: 'hashtag0', count: 4 },
          { hashtag: 'hashtag2', count: 3 },
          { hashtag: 'hashtag3', count: 2 },
          { hashtag: 'hashtag1', count: 1 }
        ]
      })
    })
  })
})
