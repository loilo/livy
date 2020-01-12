const io = require('socket.io-client')
const { SocketIoHandler } = require('../src/socket.io-handler')

describe('@livy/socket.io-handler', () => {
  afterEach(() => {
    io.__reset()
  })

  it('should not attempt to create a socket.io connection on handler creation', () => {
    new SocketIoHandler('https://example.com')

    expect(io).not.toHaveBeenCalled()
  })

  it('should attempt to create a socket.io connection on first log', async () => {
    const handler = new SocketIoHandler('https://example.com')

    await handler.handle(record('debug', 'Test SocketIoHandler'))

    expect(io).toHaveBeenCalledTimes(1)
    expect(io).toHaveBeenLastCalledWith('https://example.com', {})
  })

  it('should attempt to create a socket.io connection on manual connect()', async () => {
    const handler = new SocketIoHandler('https://example.com')

    await handler.connect()

    expect(io).toHaveBeenCalledTimes(1)
    expect(io).toHaveBeenLastCalledWith('https://example.com', {})
  })

  it("should not attempt to create a socket.io connection when there's already one present", async () => {
    const handler = new SocketIoHandler('https://example.com')

    await handler.connect()
    await handler.connect()

    expect(io).toHaveBeenCalledTimes(1)
    expect(io).toHaveBeenLastCalledWith('https://example.com', {})
  })

  it('should reset the connection on disconnect', async () => {
    const handler = new SocketIoHandler('https://example.com')

    await handler.connect()
    io.__mock__.disconnect()
    await handler.connect()

    expect(io).toHaveBeenCalledTimes(2)
    expect(io).toHaveBeenNthCalledWith(1, 'https://example.com', {})
    expect(io).toHaveBeenNthCalledWith(2, 'https://example.com', {})
  })

  it('should fail to connect on connection error', async () => {
    io.__mock__.connectableState = 'error'
    const handler = new SocketIoHandler('https://example.com')

    let connectionError
    try {
      await handler.connect()
    } catch (error) {
      connectionError = error
    }

    expect(connectionError).toEqual(new Error('Mock connection error'))
  })

  it('should fail to connect on connection timeout', async () => {
    io.__mock__.connectableState = 'timeout'
    const handler = new SocketIoHandler('https://example.com')

    let connectionError
    try {
      await handler.connect()
    } catch (error) {
      connectionError = error
    }

    expect(connectionError).toEqual(new Error('Mock connection timeout'))
  })

  it('should pass on connection options to the socket.io client initializer', async () => {
    const handler = new SocketIoHandler('https://example.com', {
      connection: { foo: 1, bar: 2 }
    })

    await handler.handle(record('debug', 'Test SocketIoHandler'))

    expect(io).toHaveBeenCalledTimes(1)
    expect(io).toHaveBeenLastCalledWith('https://example.com', {
      foo: 1,
      bar: 2
    })
  })

  it('should emit a log event for each log record', async () => {
    const handler = new SocketIoHandler('https://example.com')

    await handler.handle(
      record('debug', 'Test SocketIoHandler', {
        context: { context: true },
        extra: { extra: true }
      })
    )
    await handler.handle(
      record('info', 'Test SocketIoHandler', { extra: { extra: true } })
    )

    expect(io.__mock__.emit).toHaveBeenCalledTimes(2)
    expect(io.__mock__.emit).toHaveBeenNthCalledWith(
      1,
      'log',
      record('debug', 'Test SocketIoHandler', {
        context: { context: true },
        extra: { extra: true }
      })
    )
    expect(io.__mock__.emit).toHaveBeenNthCalledWith(
      2,
      'log',
      record('info', 'Test SocketIoHandler', {
        extra: { extra: true }
      })
    )
  })

  it('should emit a log event for each log record (batch handling)', async () => {
    const handler = new SocketIoHandler('https://example.com')

    await handler.handleBatch([
      record('debug', 'Test SocketIoHandler'),
      record('info', 'Test SocketIoHandler')
    ])

    expect(io.__mock__.emit).toHaveBeenCalledTimes(2)
    expect(io.__mock__.emit).toHaveBeenNthCalledWith(
      1,
      'log',
      record('debug', 'Test SocketIoHandler')
    )
    expect(io.__mock__.emit).toHaveBeenNthCalledWith(
      2,
      'log',
      record('info', 'Test SocketIoHandler')
    )
  })

  it('should not emit anything with no matching record (batch handling)', async () => {
    const handler = new SocketIoHandler('https://example.com', {
      level: 'warning'
    })

    await handler.handleBatch([
      record('debug', 'Test SocketIoHandler'),
      record('info', 'Test SocketIoHandler')
    ])

    expect(io.__mock__.emit).not.toHaveBeenCalled()
  })

  it('should close the socket.io connection on handler close', async () => {
    const handler = new SocketIoHandler('https://example.com')

    handler.close()
    await tick()
    // Should not be called when no log was emitted -> no connection has been established
    expect(io.__mock__.close).not.toHaveBeenCalled()

    await handler.handle(record('info'))

    handler.close()
    await tick()
    expect(io.__mock__.close).toHaveBeenCalledTimes(1)
  })

  it('should respect the "level" option', async () => {
    const handler = new SocketIoHandler('https://example.com', {
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()

    await handler.handle(record('info'))
    await handler.handle(record('notice'))

    expect(io.__mock__.emit).toHaveBeenCalledTimes(1)
    expect(io.__mock__.emit).toHaveBeenLastCalledWith('log', record('notice'))
  })

  it('should respect the "bubble" option', async () => {
    const bubblingHandler = new SocketIoHandler('https://example.com')
    const nonBubblingHandler = new SocketIoHandler('https://example.com', {
      bubble: false
    })

    expect(await bubblingHandler.handle(record('debug'))).toBeFalse()
    expect(await nonBubblingHandler.handle(record('debug'))).toBeTrue()
  })
})
