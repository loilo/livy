import { vi } from 'vitest'

export function MockHandler({
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
  this.isHandling = vi.fn(() => handle)
  this.handle = vi.fn(() => Promise.resolve(!bubble))
  this.handleBatch = vi.fn(
    batchImplemented
      ? records =>
          Promise.all(records.map(record => this.handle(record))).then(() => {})
      : undefined
  )

  if (sync) {
    this.handleSync = vi.fn(() => !bubble)
    this.handleBatchSync = vi.fn()
    this.handleBatchSync = vi.fn(
      batchImplemented
        ? records => {
            records.forEach(record => this.handleSync(record))
          }
        : undefined
    )
  }

  if (closable) {
    this.close = vi.fn()
  }

  if (resettable) {
    this.reset = vi.fn()
  }

  if (formattable) {
    const getFormatter = vi.fn()
    const setFormatter = vi.fn()

    this.__mock__.getFormatter = getFormatter
    this.__mock__.setFormatter = setFormatter

    Object.defineProperty(this, 'formatter', {
      get: getFormatter,
      set: setFormatter
    })
  }
}
