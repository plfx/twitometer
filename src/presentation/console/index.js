class ConsolePresenter {
  constructor(processor, stream) {
    this.processor = processor
    this.stream = stream

    this.stream.on('data', (data) => this.processor.handle(data))

    this.displayHandle = setInterval(async () => console.log(
      JSON.stringify(await this.processor.report(), null, 2)
    ), 500)
  }
}

module.exports = { ConsolePresenter }
