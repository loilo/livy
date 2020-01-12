const { SyncLogger } = require('../src/sync-logger')
const { AsyncLogger } = require('../src/async-logger')
const { MixedLogger } = require('../src/mixed-logger')
const { createLogger } = require('../src/logger-factory')

describe('@livy/logger/lib/logger-factory', () => {
  it('should create a (mixed) logger with just a name', () => {
    const logger = createLogger('logs')
    expect(logger).toBeInstanceOf(MixedLogger)
    expect(logger.name).toBe('logs')
  })

  it('should create a basic sync logger', () => {
    const logger = createLogger('logs', { mode: 'sync' })
    expect(logger).toBeInstanceOf(SyncLogger)
    expect(logger.name).toBe('logs')
  })

  it('should create a basic async logger', () => {
    const logger = createLogger('logs', { mode: 'async' })
    expect(logger).toBeInstanceOf(AsyncLogger)
    expect(logger.name).toBe('logs')
  })

  it('should fail to create a logger with an invalid mode', () => {
    expect(() => {
      createLogger('logs', { mode: 'foo' })
    }).toThrowError(
      new Error(
        'Invalid logging mode "foo". Use one of "sync", "async" or "mixed".'
      )
    )
  })

  it('should reflect provided timezone', () => {
    const logger = createLogger('logs', {
      timezone: 'UTC'
    })

    expect(logger.timezone).toBe('UTC')
  })

  it('should contain initial handlers', () => {
    const handler = new MockHandler()
    const logger = createLogger('logs', {
      handlers: [handler]
    })

    expect([...logger.handlers]).toEqual([handler])
  })

  it('should contain initial processors', () => {
    const identityProcessor = record => record
    const logger = createLogger('logs', {
      processors: [identityProcessor]
    })

    expect([...logger.processors]).toEqual([identityProcessor])
  })

  it('should respect the provided timezone', () => {
    expect(
      createLogger('logs', { timezone: 'America/New_York' }).timezone
    ).toBe('America/New_York')
    expect(createLogger('logs', { timezone: 'Asia/Shanghai' }).timezone).toBe(
      'Asia/Shanghai'
    )
  })
})
