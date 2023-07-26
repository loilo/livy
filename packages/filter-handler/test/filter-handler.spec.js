import { FilterHandler } from '../src/filter-handler'

describe('@livy/filter-handler', () => {
  it('should always return "true" for "isHandling"', () => {
    const wrappedHandler = new MockHandler()
    const handler = new FilterHandler(wrappedHandler, () => false)

    expect(handler.isHandling('debug')).toBeTrue()
  })

  it('should block records not passing the test', () => {
    const wrappedHandler = new MockHandler()
    const handler = new FilterHandler(wrappedHandler, () => false)

    handler.handleSync(record('debug', 'Test FilterHandler'))
    handler.handleSync(record('emergency', 'Test FilterHandler'))

    expect(wrappedHandler.handleSync).not.toHaveBeenCalled()
  })

  it('should pass records passing the test', () => {
    const wrappedHandler = new MockHandler()
    const handler = new FilterHandler(wrappedHandler, () => true)

    const debugRecord = record('debug', 'Test FilterHandler')
    handler.handleSync(debugRecord)

    const emergencyRecord = record('emergency', 'Test FilterHandler')
    handler.handleSync(emergencyRecord)

    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(2)
    expect(wrappedHandler.handleSync).toHaveBeenNthCalledWith(1, debugRecord)
    expect(wrappedHandler.handleSync).toHaveBeenNthCalledWith(
      2,
      emergencyRecord
    )
  })

  it('should pass a log record to the test', () => {
    const wrappedHandler = new MockHandler()
    const testCallback = jest.fn()
    const handler = new FilterHandler(wrappedHandler, testCallback)

    const debugRecord = record('debug', 'Test FilterHandler')
    handler.handleSync(debugRecord)

    expect(testCallback).toHaveBeenCalledTimes(1)
    expect(testCallback).toHaveBeenCalledWith(debugRecord)
  })

  it('should report to bubble when a record is not handled', async () => {
    const wrappedHandler = new MockHandler()
    const handler = new FilterHandler(wrappedHandler, () => false, {
      bubble: false
    })

    expect(handler.handleSync(record('debug'))).toBe(false)
    expect(await handler.handle(record('debug'))).toBe(false)
  })

  it('should filter records in batch handling', async () => {
    const wrappedHandler = new MockHandler()
    const handler = new FilterHandler(
      wrappedHandler,
      record => record.severity >= 4 && record.severity <= 5
    )

    handler.handleBatchSync([
      record('info', 'Test FilterHandler'),
      record('notice', 'Test FilterHandler')
    ])

    await handler.handleBatch([
      record('info', 'Test FilterHandler'),
      record('notice', 'Test FilterHandler')
    ])

    expect(wrappedHandler.handleBatch).toHaveBeenCalledTimes(1)
    expect(wrappedHandler.handleBatch).toHaveBeenLastCalledWith([
      record('notice', 'Test FilterHandler')
    ])

    expect(wrappedHandler.handleBatchSync).toHaveBeenCalledTimes(1)
    expect(wrappedHandler.handleBatchSync).toHaveBeenLastCalledWith([
      record('notice', 'Test FilterHandler')
    ])
  })

  it('should fail to activate async handlers in sync environment', () => {
    const handler = new FilterHandler(
      new MockHandler({ sync: false }),
      () => true
    )

    expect(() => {
      handler.handleSync(record('warning', 'Test FilterHandler'))
    }).toThrowError(
      new Error('Cannot activate asynchronous handler in sync mode')
    )

    expect(() => {
      handler.handleBatchSync([record('warning', 'Test FilterHandler')])
    }).toThrowError(
      new Error('Cannot activate asynchronous handler in sync mode')
    )
  })

  it('should reset processors on reset', () => {
    const processor = {
      process: x => x,
      reset: jest.fn()
    }

    const handler = new FilterHandler(new MockHandler(), () => true)
    handler.processors.add(processor)
    expect(processor.reset).not.toHaveBeenCalled()

    handler.reset()
    expect(processor.reset).toHaveBeenCalledTimes(1)
  })

  it('should invoke reset on wrapped handler when applicable', () => {
    const wrappedHandler = new MockHandler({ resettable: true })
    const handler = new FilterHandler(wrappedHandler, () => true)

    handler.reset()

    expect(wrappedHandler.reset).toHaveBeenCalledTimes(1)
  })

  it('should invoke close on wrapped handler when applicable', () => {
    const wrappedHandler = new MockHandler({ closable: true })
    const handler = new FilterHandler(wrappedHandler, () => true)

    handler.close()

    expect(wrappedHandler.close).toHaveBeenCalledTimes(1)
  })

  it('should fail to omit test callback on construction', () => {
    const wrappedHandler = new MockHandler()

    expect(() => {
      const handler = new FilterHandler(wrappedHandler)
    }).toThrowError(
      new TypeError('Filter test must be a function, got undefined')
    )
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new FilterHandler(new MockHandler(), () => true)
    const nonBubblingHandler = new FilterHandler(
      new MockHandler(),
      () => true,
      {
        bubble: false
      }
    )

    expect(bubblingHandler.handleSync(record('debug'))).toBeFalse()
    expect(nonBubblingHandler.handleSync(record('debug'))).toBeTrue()
  })

  it('should respect the "bubble" option (async)', async () => {
    const bubblingHandler = new FilterHandler(new MockHandler(), () => true)
    const nonBubblingHandler = new FilterHandler(
      new MockHandler(),
      () => true,
      {
        bubble: false
      }
    )

    expect(await bubblingHandler.handle(record('debug'))).toBeFalse()
    expect(await nonBubblingHandler.handle(record('debug'))).toBeTrue()
  })
})
