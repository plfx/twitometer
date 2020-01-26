const assert = require('assert')

const { EmojiStatsView } = require('./')

describe('EmojiStatsView', function() {
  before(function() {
    this.view = new EmojiStatsView()
  })

  describe('processTweet', function() {
    before(function() {
      this.sampleData = {
        count: 100,
        countWithEmoji: 20,
        emoji: {
          '😊': 12,
          '🐉': 8
        }
      }

      this.view.processTweet({
        text: '🐉Hello 😊🐉'
      }, this.sampleData)
    })

    it('updates the sample data', function() {
      assert.deepEqual(this.sampleData, {
        count: 101,
        countWithEmoji: 21,
        emoji: {
          '😊': 13,
          '🐉': 9
        }
      })
    })
  })

  describe('aggregateSamples', function() {
    before(function() {
      this.aggregated = this.view.aggregateSamples([
        {
          count: 5,
          countWithEmoji: 1,
          emoji: {
            '🐉': 1
          }
        },
        {
          count: 10,
          countWithEmoji: 4,
          emoji: {
            '😊': 1,
            '🐉': 3
          }
        },
        {
          count: 5,
          countWithEmoji: 5,
          emoji: {
            '😊': 3,
            '🐉': 2
          }
        }
      ])
    })

    it('sums correctly', function() {
      assert.deepEqual(this.aggregated, {
        count: 20,
        countWithEmoji: 10,
        emoji: {
          '😊': 4,
          '🐉': 6
        }
      })
    })
  })

  describe('generateReport', function() {
    before(function() {
      this.report = this.view.generateReport({
        count: 100,
        countWithEmoji: 10,
        emoji: {
          '😊': 4,
          '🐉': 1,
          '🐹': 3,
          '🙄': 2
        }
      })
    })

    it('generates correct stats', function() {
      assert.deepEqual(this.report, {
        count: 100,
        countWithEmoji: 10,
        emojiByCount: [
          { emoji: '😊', count: 4 },
          { emoji: '🐹', count: 3 },
          { emoji: '🙄', count: 2 },
          { emoji: '🐉', count: 1 }
        ]
      })
    })
  })
})
