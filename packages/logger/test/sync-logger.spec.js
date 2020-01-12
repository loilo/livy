const { AbstractLogger } = require('../src/abstract-logger')
const { SyncLogger } = require('../src/sync-logger')
const { DateTime } = require('luxon')

describe('@livy/logger/lib/sync-logger', () => {
  afterEach(() => {
    date.release()
    AbstractLogger.clearExitHandlers()
  })

  it('should be able to clone itself with same options but a new name', () => {
    const handler = new MockHandler()
    const processor = record => record
    const logger = new SyncLogger('logs', {
      handlers: [handler],
      processors: [processor],
      timezone: 'UTC'
    })

    const otherLogger = logger.withName('other-logs')

    expect(otherLogger).toBeInstanceOf(SyncLogger)
    expect(otherLogger.timezone).toBe('UTC')
    expect(otherLogger.name).toBe('other-logs')
    expect([...otherLogger.handlers]).toEqual([handler])
    expect([...otherLogger.processors]).toEqual([processor])
  })

  it('should fail to create an instance with async handlers', () => {
    const handler = new MockHandler({ sync: false })
    const logger = new SyncLogger({
      handlers: [handler]
    })

    expect(() => {
      logger.handlers.add(handler)
    }).toThrowError(
      new Error('Invalid asynchronous handler in synchronous logger instance')
    )
  })

  it('should fail to add an exclusively async handler to a sync logger', () => {
    const handler = new MockHandler({ sync: false })
    const logger = new SyncLogger()

    expect(() => {
      logger.handlers.add(handler)
    }).toThrowError(
      new Error('Invalid asynchronous handler in synchronous logger instance')
    )
  })

  it('should forward log records to handlers', () => {
    const handler = new MockHandler()
    const logger = new SyncLogger('logs', { handlers: [handler] })

    logger.debug('Test logger')
    logger.info('Test logger')
    logger.notice('Test logger')
    logger.warning('Test logger')
    logger.error('Test logger')
    logger.critical('Test logger')
    logger.alert('Test logger')
    logger.emergency('Test logger')

    expect(handler.handleSync).toHaveBeenCalledTimes(8)
  })

  it('should call all attached handlers with processors applied', () => {
    const handler1 = new MockHandler()
    const handler2 = new MockHandler()

    const logger = new SyncLogger('logs', {
      handlers: [handler1, handler2],
      processors: [
        record => {
          record.extra.foo = true
          return record
        },
        {
          process(record) {
            record.extra.bar = false
            return record
          }
        }
      ]
    })

    logger.debug('Test logger')
    logger.info('Test logger', { context: true })

    expect(handler1.handleSync).toHaveBeenCalledTimes(2)
    expect(handler1.handleSync).toHaveBeenNthCalledWith(
      1,
      record('debug', 'Test logger', {
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
    expect(handler1.handleSync).toHaveBeenNthCalledWith(
      2,
      record('info', 'Test logger', {
        context: { context: true },
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
    expect(handler2.handleSync).toHaveBeenCalledTimes(2)
    expect(handler2.handleSync).toHaveBeenNthCalledWith(
      1,
      record('debug', 'Test logger', {
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
    expect(handler2.handleSync).toHaveBeenNthCalledWith(
      2,
      record('info', 'Test logger', {
        context: { context: true },
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
  })

  it('should handle bubbling of handlers correctly', () => {
    const bubblingHandler = new MockHandler()
    const fallbackHandler = new MockHandler()

    const logger = new SyncLogger('logs', {
      handlers: [fallbackHandler, bubblingHandler]
    })

    // Explicit return value `false`
    bubblingHandler.handleSync.mockReturnValueOnce(false)

    logger.debug('Test logger')

    expect(bubblingHandler.handleSync).toHaveBeenCalledTimes(1)
    expect(fallbackHandler.handleSync).toHaveBeenCalledTimes(1)

    // Implicit return value `undefined`
    bubblingHandler.handleSync.mockReturnValueOnce(undefined)

    logger.debug('Test logger')

    expect(bubblingHandler.handleSync).toHaveBeenCalledTimes(2)
    expect(fallbackHandler.handleSync).toHaveBeenCalledTimes(2)

    // Explicit return value `true`
    bubblingHandler.handleSync.mockReturnValueOnce(true)

    logger.debug('Test logger')

    expect(bubblingHandler.handleSync).toHaveBeenCalledTimes(3)
    expect(fallbackHandler.handleSync).toHaveBeenCalledTimes(2)
  })

  it('should close appropriate handlers on logger close', () => {
    const nonClosableHandler = new MockHandler({ closable: false })
    const closableHandler = new MockHandler({ closable: true })

    const logger = new SyncLogger('logs', {
      handlers: [nonClosableHandler, closableHandler]
    })

    logger.close()

    expect(closableHandler.close).toHaveBeenCalledTimes(1)
  })
})
