const yaml = require('js-yaml')
const logUpdate = require('log-update')

class ConsolePresenter {
  constructor(processor, stream) {
    this.processor = processor
    this.stream = stream

    this.stream.on('data', (data) => this.processor.handle(data))

    this.displayHandle = setInterval(async () => logUpdate(
      yaml.safeDump(await this.processor.report())
    ), 1000)
  }
}

module.exports = { ConsolePresenter }
