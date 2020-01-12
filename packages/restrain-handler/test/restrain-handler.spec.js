const { RestrainHandler } = require('../src/restrain-handler')

describe('@livy/restrain-handler', () => {
  it('should always handle records', () => {
    const handler = new RestrainHandler(new MockHandler())
    expect(handler.isHandling('debug')).toBeTrue()
    expect(handler.isHandling('info')).toBeTrue()
    expect(handler.isHandling('notice')).toBeTrue()
    expect(handler.isHandling('warning')).toBeTrue()
    expect(handler.isHandling('error')).toBeTrue()
    expect(handler.isHandling('critical')).toBeTrue()
    expect(handler.isHandling('alert')).toBeTrue()
    expect(handler.isHandling('emergency')).toBeTrue()
  })

  it('should use "warning" as the default activation level', () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler)

    handler.handleSync(record('debug', 'Test RestrainHandler'))
    handler.handleSync(record('info', 'Test RestrainHandler'))
    handler.handleSync(record('notice', 'Test RestrainHandler'))

    expect(wrappedHandler.handleSync).not.toHaveBeenCalled()

    handler.handleSync(record('warning', 'Test RestrainHandler'))

    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(4)
  })

  it('should use "warning" as the default activation level (async)', async () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler)

    await handler.handle(record('debug', 'Test RestrainHandler'))
    await handler.handle(record('info', 'Test RestrainHandler'))
    await handler.handle(record('notice', 'Test RestrainHandler'))

    expect(wrappedHandler.handle).not.toHaveBeenCalled()

    await handler.handle(record('warning', 'Test RestrainHandler'))

    expect(wrappedHandler.handle).toHaveBeenCalledTimes(4)
  })

  it('should clear the buffer after flushing records', () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler, {
      activationStrategy: 'warning'
    })

    handler.handleSync(record('warning', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(1)

    wrappedHandler.handleSync.mockClear()

    handler.handleSync(record('error', 'Test RestrainHandler'))

    // If the buffer was not cleared correctly, the handler would receive the "warning" and "error" records
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(1)
  })

  it('should clear the buffer on reset', () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler, {
      activationStrategy: 'warning'
    })

    handler.handleSync(record('notice', 'Test RestrainHandler'))
    handler.reset()
    handler.handleSync(record('error', 'Test RestrainHandler'))

    // If the buffer was not cleared correctly,
    // the handler would receive the "notice" and "error" records
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(1)
  })

  it('should reset processors on reset', () => {
    const processor = {
      process: x => x,
      reset: jest.fn()
    }

    const handler = new RestrainHandler(new MockHandler())
    handler.processors.add(processor)
    expect(processor.reset).not.toHaveBeenCalled()

    handler.reset()
    expect(processor.reset).toHaveBeenCalledTimes(1)
  })

  it('should invoke reset on wrapped handler when applicable', () => {
    const wrappedHandler = new MockHandler({ resettable: true })
    const handler = new RestrainHandler(wrappedHandler)

    handler.reset()

    expect(wrappedHandler.reset).toHaveBeenCalledTimes(1)
  })

  it('should invoke close on wrapped handler when applicable', () => {
    const wrappedHandler = new MockHandler({ closable: true })
    const handler = new RestrainHandler(wrappedHandler)

    handler.close()

    // close() is not called when the buffer is empty
    expect(wrappedHandler.close).toHaveBeenCalledTimes(0)

    handler.handleSync(record('notice', 'Test RestrainHandler'))
    handler.close()
    expect(wrappedHandler.close).toHaveBeenCalledTimes(1)
  })

  it('should fail to activate async handlers in sync environment', async () => {
    // All errors caught in this test are of the same structure,
    // but are thrown in different branches and therefore tested individually

    const handler = new RestrainHandler(new MockHandler({ sync: false }), {
      stopBuffering: true
    })

    expect(() => {
      handler.handleSync(record('warning', 'Test RestrainHandler'))
    }).toThrowError(
      new Error('Cannot activate asynchronous handler in sync mode')
    )

    expect(() => {
      handler.handleBatchSync([record('warning', 'Test RestrainHandler')])
    }).toThrowError(
      new Error('Cannot activate asynchronous handler in sync mode')
    )

    // Stop buffering by activating the handler
    await handler.handle(record('warning', 'Test RestrainHandler'))

    expect(() => {
      handler.handleSync(record('warning', 'Test RestrainHandler'))
    }).toThrowError(
      new Error('Cannot activate asynchronous handler in sync mode')
    )
  })

  it('should respect the "activationStrategy" option (level string)', () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler, {
      activationStrategy: 'info'
    })

    handler.handleSync(record('debug', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).not.toHaveBeenCalled()

    handler.handleSync(record('info', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(2)
  })

  it('should respect the "activationStrategy" option (callback)', () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler, {
      activationStrategy(record) {
        return record.context.activate === true
      }
    })

    handler.handleSync(record('warning', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).not.toHaveBeenCalled()

    handler.handleSync(
      record('warning', 'Test RestrainHandler', {
        context: { activate: true }
      })
    )
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(2)
  })

  it('should respect the "bufferSize" option', async () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler, {
      bufferSize: 2
    })

    // Test with sync handling
    handler.handleSync(record('info', 'Test RestrainHandler'))
    handler.handleSync(record('notice', 'Test RestrainHandler'))
    handler.handleSync(record('warning', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(2)
    expect(wrappedHandler.handleSync).toHaveBeenNthCalledWith(
      1,
      record('notice', 'Test RestrainHandler')
    )
    expect(wrappedHandler.handleSync).toHaveBeenNthCalledWith(
      2,
      record('warning', 'Test RestrainHandler')
    )

    // Test with async handling
    await handler.handle(record('info', 'Test RestrainHandler'))
    await handler.handle(record('notice', 'Test RestrainHandler'))
    await handler.handle(record('warning', 'Test RestrainHandler'))
    expect(wrappedHandler.handle).toHaveBeenCalledTimes(2)
    expect(wrappedHandler.handle).toHaveBeenNthCalledWith(
      1,
      record('notice', 'Test RestrainHandler')
    )
    expect(wrappedHandler.handle).toHaveBeenNthCalledWith(
      2,
      record('warning', 'Test RestrainHandler')
    )
  })

  it('should respect the "stopBuffering" option', async () => {
    const wrappedHandler = new MockHandler()
    const handler = new RestrainHandler(wrappedHandler, {
      stopBuffering: true
    })

    handler.handleSync(record('info', 'Test RestrainHandler'))
    handler.handleSync(record('notice', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(0)

    handler.handleSync(record('warning', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(3)

    wrappedHandler.handleSync.mockClear()

    handler.handleSync(record('info', 'Test RestrainHandler'))
    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(1)

    wrappedHandler.handleSync.mockClear()

    // Test with async handling
    await handler.handle(record('info', 'Test RestrainHandler'))
    expect(wrappedHandler.handle).toHaveBeenCalledTimes(1)
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new RestrainHandler(new MockHandler())
    const nonBubblingHandler = new RestrainHandler(new MockHandler(), {
      bubble: false
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBeFalse()
    expect(nonBubblingHandler.handleSync(record('debug'))).toBeTrue()
  })
})
