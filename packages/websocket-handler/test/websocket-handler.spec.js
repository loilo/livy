jest.mock('engine.io-client')

const eio = await import('engine.io-client')
const { WebSocketHandler } = await import('../src/websocket-handler')

describe('@livy/websocket-handler', () => {
  afterEach(() => {
    eio.__reset()
  })

  it('should not attempt to create an engine.io connection on handler creation', () => {
    new WebSocketHandler('wss://example.com')

    expect(eio).not.toHaveBeenCalled()
  })

  it('should attempt to create an engine.io connection on first log', async () => {
    const handler = new WebSocketHandler('wss://example.com')

    await handler.handle(record('debug', 'Test WebSocketHandler'))

    expect(eio).toHaveBeenCalledTimes(1)
    expect(eio).toHaveBeenLastCalledWith('wss://example.com', {
      transports: ['websocket']
    })
  })

  it('should attempt to create an engine.io connection on manual connect()', async () => {
    const handler = new WebSocketHandler('wss://example.com')

    await handler.connect()

    expect(eio).toHaveBeenCalledTimes(1)
    expect(eio).toHaveBeenLastCalledWith('wss://example.com', {
      transports: ['websocket']
    })
  })

  it("should not attempt to create an engine.io connection when there's already one present", async () => {
    const handler = new WebSocketHandler('wss://example.com')

    await handler.connect()
    await handler.connect()

    expect(eio).toHaveBeenCalledTimes(1)
    expect(eio).toHaveBeenLastCalledWith('wss://example.com', {
      transports: ['websocket']
    })
  })

  it('should reset the connection on disconnect', async () => {
    const handler = new WebSocketHandler('wss://example.com')

    await handler.connect()
    eio.__mock__.close()
    await handler.connect()

    expect(eio).toHaveBeenCalledTimes(2)
    expect(eio).toHaveBeenNthCalledWith(1, 'wss://example.com', {
      transports: ['websocket']
    })
    expect(eio).toHaveBeenNthCalledWith(2, 'wss://example.com', {
      transports: ['websocket']
    })
  })

  it('should fail to connect on connection error', async () => {
    eio.__mock__.connectable = false
    const handler = new WebSocketHandler('wss://example.com')

    let connectionError
    try {
      await handler.connect()
    } catch (error) {
      connectionError = error
    }

    expect(connectionError).toEqual(new Error('Mock connection error'))
  })

  it('should pass on connection options to the Engine.IO client initializer', async () => {
    const handler = new WebSocketHandler('wss://example.com', {
      connection: { foo: 1, bar: 2 }
    })

    await handler.handle(record('debug', 'Test WebSocketHandler'))

    expect(eio).toHaveBeenCalledTimes(1)
    expect(eio).toHaveBeenLastCalledWith('wss://example.com', {
      foo: 1,
      bar: 2,
      transports: ['websocket']
    })
  })

  it('should send each log record as a JSON object', async () => {
    const handler = new WebSocketHandler('wss://example.com')

    await handler.handle(
      record('debug', 'Test WebSocketHandler', {
        context: { context: true },
        extra: { extra: true }
      })
    )
    await handler.handle(
      record('info', 'Test WebSocketHandler', { extra: { extra: true } })
    )

    expect(eio.__mock__.send).toHaveBeenCalledTimes(2)
    expect(eio.__mock__.send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify(
        record('debug', 'Test WebSocketHandler', {
          context: { context: true },
          extra: { extra: true }
        })
      )
    )
    expect(eio.__mock__.send).toHaveBeenNthCalledWith(
      2,
      JSON.stringify(
        record('info', 'Test WebSocketHandler', {
          extra: { extra: true }
        })
      )
    )
  })

  it('should send each log record when batch handling', async () => {
    const handler = new WebSocketHandler('wss://example.com')

    await handler.handleBatch([
      record('debug', 'Test WebSocketHandler'),
      record('info', 'Test WebSocketHandler')
    ])

    expect(eio.__mock__.send).toHaveBeenCalledTimes(2)
    expect(eio.__mock__.send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify(record('debug', 'Test WebSocketHandler'))
    )
    expect(eio.__mock__.send).toHaveBeenNthCalledWith(
      2,
      JSON.stringify(record('info', 'Test WebSocketHandler'))
    )
  })

  it('should not send anything with no matching record (batch handling)', async () => {
    const handler = new WebSocketHandler('wss://example.com', {
      level: 'warning'
    })

    await handler.handleBatch([
      record('debug', 'Test WebSocketHandler'),
      record('info', 'Test WebSocketHandler')
    ])

    expect(eio.__mock__.send).not.toHaveBeenCalled()
  })

  it('should close the WebSocket connection on handler close', async () => {
    const handler = new WebSocketHandler('wss://example.com')

    handler.close()
    await tick()
    // Should not be called when no log was emitted -> no connection has been established
    expect(eio.__mock__.close).not.toHaveBeenCalled()

    await handler.handle(record('info'))

    handler.close()
    await tick()
    expect(eio.__mock__.close).toHaveBeenCalledTimes(1)
  })

  it('should respect the "formatter" option', async () => {
    const formatter = new MockFormatter()
    const handler = new WebSocketHandler('wss://example.com', {
      formatter
    })

    await handler.handle(record('debug'))

    expect(formatter.format).toHaveBeenCalledTimes(1)
    expect(formatter.format).toHaveBeenLastCalledWith(record('debug'))
  })

  it('should respect the "level" option', async () => {
    const handler = new WebSocketHandler('wss://example.com', {
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()
    await handler.handle(record('info', 'Test WebSocketHandler'))
    await handler.handle(record('notice', 'Test WebSocketHandler'))

    // Expect the blocking handler to only handle the
    // `notice` record, as per the "level" option
    expect(eio.__mock__.send).toHaveBeenCalledTimes(1)
    expect(eio.__mock__.send).toHaveBeenLastCalledWith(
      JSON.stringify(record('notice', 'Test WebSocketHandler'))
    )
  })

  it('should respect the "bubble" option', async () => {
    const bubblingHandler = new WebSocketHandler('wss://example.com')
    const nonBubblingHandler = new WebSocketHandler('wss://example.com', {
      bubble: false
    })

    expect(await bubblingHandler.handle(record('debug'))).toBeFalse()
    expect(await nonBubblingHandler.handle(record('debug'))).toBeTrue()
  })
})
