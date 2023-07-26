import { AbstractLogger } from '../src/abstract-logger'
import { AsyncLogger } from '../src/async-logger'
import { DateTime } from 'luxon'

describe('@livy/logger/lib/async-logger', () => {
  afterEach(() => {
    AbstractLogger.clearExitHandlers()
  })

  it('should be able to clone itself with a new name', () => {
    const handler = new MockHandler()
    const processor = record => record
    const logger = new AsyncLogger('logs', {
      handlers: [handler],
      processors: [processor],
      timezone: 'UTC'
    })

    const otherLogger = logger.withName('other-logs')

    expect(otherLogger).toBeInstanceOf(AsyncLogger)
    expect(otherLogger.timezone).toBe('UTC')
    expect(otherLogger.name).toBe('other-logs')
    expect([...otherLogger.handlers]).toEqual([handler])
    expect([...otherLogger.processors]).toEqual([processor])
  })

  it('should forward log records to handlers', async () => {
    const handler = new MockHandler()
    const logger = new AsyncLogger('logs', { handlers: [handler] })

    Promise.all([
      logger.debug('Test logger'),
      logger.info('Test logger'),
      logger.notice('Test logger'),
      logger.warning('Test logger'),
      logger.error('Test logger'),
      logger.critical('Test logger'),
      logger.alert('Test logger'),
      logger.emergency('Test logger')
    ])

    expect(handler.handle).toHaveBeenCalledTimes(8)
  })

  it('should call all attached handlers with processors applied', async () => {
    const handler1 = new MockHandler()
    const handler2 = new MockHandler()

    const logger = new AsyncLogger('logs', {
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

    await logger.debug('Test logger')
    await logger.info('Test logger', { context: true })

    expect(handler1.handle).toHaveBeenCalledTimes(2)
    expect(handler1.handle).toHaveBeenNthCalledWith(
      1,
      record('debug', 'Test logger', {
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
    expect(handler1.handle).toHaveBeenNthCalledWith(
      2,
      record('info', 'Test logger', {
        context: { context: true },
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
    expect(handler2.handle).toHaveBeenCalledTimes(2)
    expect(handler2.handle).toHaveBeenNthCalledWith(
      1,
      record('debug', 'Test logger', {
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
    expect(handler2.handle).toHaveBeenNthCalledWith(
      2,
      record('info', 'Test logger', {
        context: { context: true },
        extra: { foo: true, bar: false },
        datetime: expect.any(DateTime)
      })
    )
  })

  it('should handle bubbling of handlers correctly', async () => {
    const bubblingHandler = new MockHandler()
    const fallbackHandler = new MockHandler()

    const logger = new AsyncLogger('logs', {
      handlers: [bubblingHandler, fallbackHandler]
    })

    // Explicit return value `false`
    await bubblingHandler.handle.mockReturnValueOnce(false)

    logger.debug('Test logger')

    expect(await bubblingHandler.handle).toHaveBeenCalledTimes(1)
    expect(await fallbackHandler.handle).toHaveBeenCalledTimes(1)

    // Implicit return value `undefined`
    await bubblingHandler.handle.mockReturnValueOnce(undefined)

    logger.debug('Test logger')

    expect(await bubblingHandler.handle).toHaveBeenCalledTimes(2)
    expect(await fallbackHandler.handle).toHaveBeenCalledTimes(2)

    // Explicit return value `true`
    bubblingHandler.handle.mockReturnValueOnce(Promise.resolve(true))

    logger.debug('Test logger')

    expect(await bubblingHandler.handle).toHaveBeenCalledTimes(3)
    expect(await fallbackHandler.handle).toHaveBeenCalledTimes(2)
  })

  it('should close appropriate handlers on logger close', () => {
    const nonClosableHandler = new MockHandler({ closable: false })
    const closableHandler = new MockHandler({ closable: true })

    const logger = new AsyncLogger('logs', {
      handlers: [nonClosableHandler, closableHandler]
    })

    logger.close()

    expect(closableHandler.close).toHaveBeenCalledTimes(1)
  })
})
