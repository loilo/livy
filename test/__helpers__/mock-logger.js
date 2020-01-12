const MockSet = require('./mock-set')

function MockLogger() {
  this.__mock__ = {}

  this.name = ''
  this.withName = jest.fn(() => new MockLogger())
  this.handlers = new MockSet()
  this.processors = new MockSet()
  this.close = jest.fn()
  this.isHandling = jest.fn(() => true)
  this.log = jest.fn(async () => {})
  this.debug = jest.fn((...args) => this.log('debug', ...args))
  this.info = jest.fn((...args) => this.log('info', ...args))
  this.notice = jest.fn((...args) => this.log('notice', ...args))
  this.warning = jest.fn((...args) => this.log('warning', ...args))
  this.error = jest.fn((...args) => this.log('error', ...args))
  this.critical = jest.fn((...args) => this.log('critical', ...args))
  this.alert = jest.fn((...args) => this.log('alert', ...args))
  this.emergency = jest.fn((...args) => this.log('emergency', ...args))
}

MockLogger.clearExitHandlers = jest.fn()

module.exports = MockLogger
