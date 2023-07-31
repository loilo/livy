import { vi } from 'vitest'
import { MockSet } from './mock-set.js'

function MockLogger() {
  this.__mock__ = {}

  this.name = ''
  this.withName = vi.fn(() => new MockLogger())
  this.handlers = new MockSet()
  this.processors = new MockSet()
  this.close = vi.fn()
  this.isHandling = vi.fn(() => true)
  this.log = vi.fn(async () => {})
  this.debug = vi.fn((...args) => this.log('debug', ...args))
  this.info = vi.fn((...args) => this.log('info', ...args))
  this.notice = vi.fn((...args) => this.log('notice', ...args))
  this.warning = vi.fn((...args) => this.log('warning', ...args))
  this.error = vi.fn((...args) => this.log('error', ...args))
  this.critical = vi.fn((...args) => this.log('critical', ...args))
  this.alert = vi.fn((...args) => this.log('alert', ...args))
  this.emergency = vi.fn((...args) => this.log('emergency', ...args))
}

MockLogger.clearExitHandlers = vi.fn()

export { MockLogger }
