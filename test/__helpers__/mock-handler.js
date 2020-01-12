module.exports = function MockHandler({
  // Whether the handler is handling any records
  handle = true,

  // Whether the handler bubbles
  bubble = true,

  // Whether the handler has synchronous methods
  sync = true,

  // Whether the handler is closable
  closable = false,

  // Whether the handler is resettable
  resettable = false,

  // Whether the handler is formattable
  formattable = false,

  // Whether the batch handle methods should call the single handle methods
  batchImplemented = true
} = {}) {
  this.__mock__ = {}
  this.isHandling = jest.fn(() => handle)
  this.handle = jest.fn(() => Promise.resolve(!bubble))
  this.handleBatch = jest.fn(
    batchImplemented
      ? records =>
          Promise.all(records.map(record => this.handle(record))).then(() => {})
      : undefined
  )

  if (sync) {
    this.handleSync = jest.fn(() => !bubble)
    this.handleBatchSync = jest.fn()
    this.handleBatchSync = jest.fn(
      batchImplemented
        ? records => {
            records.forEach(record => this.handleSync(record))
          }
        : undefined
    )
  }

  if (closable) {
    this.close = jest.fn()
  }

  if (resettable) {
    this.reset = jest.fn()
  }

  if (formattable) {
    const getFormatter = jest.fn()
    const setFormatter = jest.fn()

    this.__mock__.getFormatter = getFormatter
    this.__mock__.setFormatter = setFormatter

    Object.defineProperty(this, 'formatter', {
      get: getFormatter,
      set: setFormatter
    })
  }
}
