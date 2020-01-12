const { AbstractLogger } = require('../src/abstract-logger')

class Logger extends AbstractLogger {
  constructor(options = {}) {
    super('logs', options)

    this.withName = jest.fn(() => new Logger())
    this.runHandlers = jest.fn(() =>
      options.mode === 'async' ? Promise.resolve() : undefined
    )
  }
}

describe('@livy/logger/lib/abstract-logger', () => {
  afterEach(() => {
    date.release()
    AbstractLogger.clearExitHandlers()
  })

  it('should correctly tell whether it has handlers for a record', () => {
    const logger = new Logger()
    const nonHandlingHandler = new MockHandler({ handle: false })
    const handlingHandler = new MockHandler({ handle: true })

    // No handlers -> false
    expect(logger.isHandling('info')).toBeFalse()

    // Only non-handling handlers -> false
    logger.handlers.add(nonHandlingHandler)
    expect(logger.isHandling('info')).toBeFalse()

    // Any number of handling handlers -> true
    logger.handlers.add(handlingHandler)
    expect(logger.isHandling('info')).toBeTrue()
  })

  it('should be able to access handlers as a Set', () => {
    const logger = new Logger()
    expect(new Logger().handlers).toBeInstanceOf(Set)
  })

  it('should be able to access processors as a Set', () => {
    expect(new Logger().processors).toBeInstanceOf(Set)
  })

  it('should ensure only properly serializable log records are passed', () => {
    const logger = new Logger()

    expect(() => {
      logger.log('debug', {})
    }).toThrowError(new Error('Log message must be a primitive, object given'))

    expect(() => {
      logger.log('debug', [])
    }).toThrowError(new Error('Log message must be a primitive, array given'))
  })

  it('should ensure valid log levels', () => {
    const logger = new Logger()

    expect(() => {
      logger.log('invalid', {})
    }).toThrowError(
      new Error(
        'Invalid log level "invalid", use one of: debug, info, notice, warning, error, critical, alert, emergency'
      )
    )
  })

  it('should reset handlers and processors on reset', () => {
    const processor1 = createMockProcessor({ resettable: false })
    const processor2 = createMockProcessor({ resettable: true })
    const processor3 = createMockProcessor({ resettable: true })

    const handler1 = new MockHandler({ resettable: false })
    const handler2 = new MockHandler({ resettable: true })
    const handler3 = new MockHandler({ resettable: true })

    const logger = new Logger({
      processors: [processor1, processor2, processor3],
      handlers: [handler1, handler2, handler3]
    })

    logger.reset()

    expect(processor2.reset).toHaveBeenCalledTimes(1)
    expect(processor3.reset).toHaveBeenCalledTimes(1)
    expect(handler2.reset).toHaveBeenCalledTimes(1)
    expect(handler3.reset).toHaveBeenCalledTimes(1)
  })

  it('should reset appropriate handlers on logger reset', () => {
    const nonResettableHandler = new MockHandler({ resettable: false })
    const resettableHandler = new MockHandler({ resettable: true })

    const logger = new Logger({
      handlers: [nonResettableHandler, resettableHandler]
    })

    logger.reset()

    expect(resettableHandler.reset).toHaveBeenCalledTimes(1)
  })

  it('should fail to accept an invalid timezone', () => {
    expect(() => {
      new Logger({ timezone: 'foo' })
    }).toThrowError(new Error('Invalid timezone "foo"'))
  })

  it('should respect the provided timezone', () => {
    expect.assertions(2)

    const logger = new Logger({ timezone: 'America/New_York' })

    logger.runHandlers
      .mockImplementationOnce(record => {
        expect(record.datetime.zone.name).toBe('America/New_York')
      })
      .mockImplementationOnce(record => {
        expect(record.datetime.zone.name).toBe('Asia/Shanghai')
      })

    logger.debug('foo')
    logger.timezone = 'Asia/Shanghai'
    logger.debug('bar')
  })
})
