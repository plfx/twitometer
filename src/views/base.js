class DataViewBase {
  constructor(viewName) {
    this.viewName = viewName
  }

  getName() {
    return this.viewName
  }
}

module.exports = { DataViewBase }
