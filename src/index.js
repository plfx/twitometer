const { WindowedProcessor } = require('./processors/windowedProcessor')
const { getStream } = require('./streams/twitterSample')

const { EmojiStatsView } = require('./views/emojiStats')
const { HashtagStatsView } = require('./views/hashtagStats')
const { PhotoStatsView } = require('./views/photoStats')
const { TweetCountView } = require('./views/tweetCount')
const { UrlStatsView } = require('./views/urlStats')

const { ConsolePresenter } = require('./presentation/console')

const views = [
  new TweetCountView(),
  new HashtagStatsView(),
  new UrlStatsView(),
  new PhotoStatsView(),
  new EmojiStatsView()
]

const processor = new WindowedProcessor(views, {
  dataWindowSizeSeconds: 24 * 60 * 60, // roll off data after 24 hours
  dataWindowResolution: 4320, // 20-second sample accumulation
})

getStream().then((stream) => {
  new ConsolePresenter(processor, stream)
})
