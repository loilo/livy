jest.mock('os')

const { StreamHandler } = await import('../src/stream-handler')

function createMockWriteStream({ writable = true } = {}) {
  return {
    write: jest.fn((_, callback) => {
      setImmediate(() => {
        if (writable) {
          callback()
        } else {
          callback(new Error('Mock: stream not writable'))
        }
      })
    })
  }
}

describe('@livy/stream-handler', () => {
  it('should write log entries to the stream', async () => {
    const stream = createMockWriteStream()
    const handler = new StreamHandler(stream)

    await handler.handle(record('info', 'Test StreamHandler'))

    expect(stream.write).toHaveBeenCalledTimes(1)
    expect(stream.write).toHaveBeenLastCalledWith(
      `${TEST_CONSTANTS.DATE_HUMAN} INFO Test StreamHandler {}\n`,
      expect.any(Function)
    )
  })

  it('should fail when stream is not writable', async () => {
    const stream = createMockWriteStream({ writable: false })
    const handler = new StreamHandler(stream)

    let writeError
    try {
      await handler.handle(record('info', 'Test StreamHandler'))
    } catch (error) {
      writeError = error
    }

    expect(writeError).toEqual(new Error('Mock: stream not writable'))
  })

  it('should respect the "formatter" option', async () => {
    const formatter = new MockFormatter()
    const handler = new StreamHandler(createMockWriteStream(), {
      formatter
    })

    await handler.handle(record('debug'))

    expect(formatter.format).toHaveBeenCalledTimes(1)
    expect(formatter.format).toHaveBeenLastCalledWith(record('debug'))
  })

  it('should respect the "level" option', async () => {
    const stream = createMockWriteStream()
    const handler = new StreamHandler(stream, {
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()
    await handler.handle(record('info', 'Test StreamHandler'))
    await handler.handle(record('notice', 'Test StreamHandler'))

    // Expect the blocking handler to only handle the
    // `notice` record, as per the "level" option
    expect(stream.write).toHaveBeenCalledTimes(1)
    expect(stream.write).toHaveBeenLastCalledWith(
      `${TEST_CONSTANTS.DATE_HUMAN} NOTICE Test StreamHandler {}\n`,
      expect.any(Function)
    )
  })

  it('should respect the "bubble" option', async () => {
    const bubblingHandler = new StreamHandler(createMockWriteStream())
    const nonBubblingHandler = new StreamHandler(createMockWriteStream(), {
      bubble: false
    })

    expect(await bubblingHandler.handle(record('debug'))).toBeFalse()
    expect(await nonBubblingHandler.handle(record('debug'))).toBeTrue()
  })
})
