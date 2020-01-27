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
  dataWindowSizeSeconds: 10 * 60, // roll off data after 10 minutes
  dataWindowResolution: 20, // divide the window into 20 sample buffers (30 sec)
})

getStream().then((stream) => {
  new ConsolePresenter(processor, stream)
})
