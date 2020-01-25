class TweetCountProcessor {
  constructor(stream) {
    this.data = {
      total: 0
    }
  }

  async handle(tweet) {
    this.data.total++
  }

  async report() {
    return Object.assign({}, this.data)
  }
}

module.exports = TweetCountProcessor
