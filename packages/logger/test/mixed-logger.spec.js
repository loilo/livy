import { AbstractLogger } from '../src/abstract-logger'
import { MixedLogger } from '../src/mixed-logger'
import { DateTime } from 'luxon'

describe('@livy/logger/lib/mixed-logger', () => {
  afterEach(() => {
    AbstractLogger.clearExitHandlers()
  })

  it('should be able to clone itself with same options but a new name', () => {
    const handler = new MockHandler()
    const processor = record => record
    const logger = new MixedLogger('logs', {
      handlers: [handler],
      processors: [processor],
      timezone: 'UTC'
    })

    const otherLogger = logger.withName('other-logs')

    expect(otherLogger).toBeInstanceOf(MixedLogger)
    expect(otherLogger.timezone).toBe('UTC')
    expect(otherLogger.name).toBe('other-logs')
    expect([...otherLogger.handlers]).toEqual([handler])
    expect([...otherLogger.processors]).toEqual([processor])
  })

  it('should allow adding an exclusively async handler', () => {
    const handler = new MockHandler({ sync: false })
    const logger = new MixedLogger()

    expect(() => {
      logger.handlers.add(handler)
    }).not.toThrow()
  })

  it('should forward log records to appropriate handler method', () => {
    const syncHandler = new MockHandler()
    const asyncHandler = new MockHandler({ sync: false })
    const logger = new MixedLogger('logs', {
      handlers: [syncHandler, asyncHandler]
    })

    logger.debug('Test logger')
    logger.info('Test logger')
    logger.notice('Test logger')
    logger.warning('Test logger')
    logger.error('Test logger')
    logger.critical('Test logger')
    logger.alert('Test logger')
    logger.emergency('Test logger')

    expect(syncHandler.handleSync).toHaveBeenCalledTimes(8)
    expect(asyncHandler.handle).toHaveBeenCalledTimes(8)
  })

  it('should call all attached handlers with processors applied', () => {
    const handler1 = new MockHandler()
    const handler2 = new MockHandler()

    const logger = new MixedLogger('logs', {
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

  it('should handle bubbling of (sync) handlers correctly', () => {
    const bubblingHandler = new MockHandler()
    const fallbackHandler = new MockHandler()

    const logger = new MixedLogger('logs', {
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

    const logger = new MixedLogger('logs', {
      handlers: [nonClosableHandler, closableHandler]
    })

    logger.close()

    expect(closableHandler.close).toHaveBeenCalledTimes(1)
  })
})
