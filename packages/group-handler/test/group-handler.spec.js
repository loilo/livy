import { describe, expect, it, vi } from 'vitest'
import { GroupHandler } from '../src/group-handler'

const { record, MockHandler } = livyTestGlobals

describe('@livy/group-handler', () => {
  it('should pass records to all handlers', () => {
    const handler1 = new MockHandler()
    const handler2 = new MockHandler()

    const wrapper = new GroupHandler([handler1, handler2])
    wrapper.handleSync(record('debug'))
    wrapper.handleSync(record('info'))

    expect(handler1.handleSync).toHaveBeenCalledTimes(2)
    expect(handler2.handleSync).toHaveBeenCalledTimes(2)
  })

  it('should run handlers in parallel', async () => {
    let wrappedHandler1done = false

    const wrappedHandler1 = new MockHandler()
    wrappedHandler1.handle.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            wrappedHandler1done = true
            resolve()
          }, 20)
        })
    )

    const wrappedHandler2 = new MockHandler()
    wrappedHandler2.handle.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (wrappedHandler1done) {
              reject(
                new Error(
                  'Handler 1 finished before handler 2 despite the delay'
                )
              )
            } else {
              resolve()
            }
          }, 0)
        })
    )

    const handler = new GroupHandler([wrappedHandler1, wrappedHandler2])

    await handler.handle(record('debug', 'Test GroupHandler'))

    expect(wrappedHandler1.handle).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.handle).toHaveBeenCalledTimes(1)
  })

  it('should batch-handle multiple records, applying processors (sync)', () => {
    const wrappedHandler1 = new MockHandler()
    const wrappedHandler2 = new MockHandler()

    const handler = new GroupHandler([wrappedHandler1, wrappedHandler2])

    handler.processors.add(record => {
      record.context.processed = true
      return record
    })

    handler.handleBatchSync([record('warning', 'Test GroupHandler')])

    expect(wrappedHandler1.handleBatchSync).toHaveBeenCalledTimes(1)
    expect(wrappedHandler1.handleBatchSync).toHaveBeenLastCalledWith([
      record('warning', 'Test GroupHandler', {
        context: { processed: true }
      })
    ])

    expect(wrappedHandler2.handleBatchSync).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.handleBatchSync).toHaveBeenLastCalledWith([
      record('warning', 'Test GroupHandler', {
        context: { processed: true }
      })
    ])
  })

  it('should batch-handle multiple records, applying processors (async)', async () => {
    const wrappedHandler1 = new MockHandler()
    const wrappedHandler2 = new MockHandler()

    const handler = new GroupHandler([wrappedHandler1, wrappedHandler2])

    handler.processors.add(record => {
      record.context.processed = true
      return record
    })

    await handler.handleBatch([record('warning', 'Test GroupHandler')])

    expect(wrappedHandler1.handleBatch).toHaveBeenCalledTimes(1)
    expect(wrappedHandler1.handleBatch).toHaveBeenLastCalledWith([
      record('warning', 'Test GroupHandler', {
        context: { processed: true }
      })
    ])

    expect(wrappedHandler2.handleBatch).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.handleBatch).toHaveBeenLastCalledWith([
      record('warning', 'Test GroupHandler', {
        context: { processed: true }
      })
    ])
  })

  it('should fail to activate async handlers in sync environment', () => {
    const handler = new GroupHandler([
      new MockHandler({ sync: true }),
      new MockHandler({ sync: false })
    ])

    expect(() => {
      handler.handleSync(record('warning', 'Test GroupHandler'))
    }).toThrowError(new Error('Cannot run asynchronous handler in sync mode'))
    expect(() => {
      handler.handleBatchSync([record('warning', 'Test GroupHandler')])
    }).toThrowError(new Error('Cannot run asynchronous handler in sync mode'))
  })

  it("should tell whether it's handling based on wrapped handlers", () => {
    expect(new GroupHandler([]).isHandling('debug')).toBe(false)
    expect(new GroupHandler([new MockHandler()]).isHandling('debug')).toBe(true)
    expect(
      new GroupHandler([new MockHandler({ handle: false })]).isHandling('debug')
    ).toBe(false)
    expect(
      new GroupHandler([
        new MockHandler({ handle: true }),
        new MockHandler({ handle: false })
      ]).isHandling('debug')
    ).toBe(true)
  })

  it('should reset processors on reset', () => {
    const processor = {
      process: x => x,
      reset: vi.fn()
    }

    const handler = new GroupHandler([])
    handler.processors.add(processor)
    expect(processor.reset).not.toHaveBeenCalled()

    handler.reset()
    expect(processor.reset).toHaveBeenCalledTimes(1)
  })

  it('should invoke reset on wrapped handler when applicable', () => {
    const wrappedHandler1 = new MockHandler({
      resettable: true
    })
    const wrappedHandler2 = new MockHandler({
      resettable: true
    })
    const wrappedHandler3 = new MockHandler({
      resettable: false
    })
    const handler = new GroupHandler([
      wrappedHandler1,
      wrappedHandler2,
      wrappedHandler3
    ])

    handler.reset()

    expect(wrappedHandler1.reset).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.reset).toHaveBeenCalledTimes(1)
  })

  it('should invoke close on wrapped handler when applicable', () => {
    const wrappedHandler1 = new MockHandler({ closable: true })
    const wrappedHandler2 = new MockHandler({ closable: true })
    const wrappedHandler3 = new MockHandler({ closable: false })
    const handler = new GroupHandler([
      wrappedHandler1,
      wrappedHandler2,
      wrappedHandler3
    ])

    handler.close()

    expect(wrappedHandler1.close).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.close).toHaveBeenCalledTimes(1)
  })

  it('should set formatters on wrapped handlers', () => {
    const wrappedHandler1 = new MockHandler({
      formattable: true
    })
    const wrappedHandler2 = new MockHandler({
      formattable: true
    })
    const wrappedHandler3 = new MockHandler({
      formattable: false
    })

    const handler = new GroupHandler([
      wrappedHandler1,
      wrappedHandler2,
      wrappedHandler3
    ])
    handler.formatter = {
      format: vi.fn(),
      formatBatch: vi.fn()
    }

    expect(wrappedHandler1.__mock__.setFormatter).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.__mock__.setFormatter).toHaveBeenCalledTimes(1)
  })

  it('should respect the "sequential" option (async)', async () => {
    let wrappedHandler1done = false

    const wrappedHandler1 = new MockHandler()
    wrappedHandler1.handle.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            wrappedHandler1done = true
            resolve()
          }, 20)
        })
    )

    const wrappedHandler2 = new MockHandler()
    wrappedHandler2.handle.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!wrappedHandler1done) {
              reject(
                new Error(
                  'Handler 2 finished before handler 1 despite sequential evaluation'
                )
              )
            } else {
              resolve()
            }
          }, 0)
        })
    )

    const handler = new GroupHandler([wrappedHandler1, wrappedHandler2], {
      sequential: true
    })

    await handler.handle(record('debug', 'Test GroupHandler'))

    expect(wrappedHandler1.handle).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.handle).toHaveBeenCalledTimes(1)
  })

  it('should respect the "sequential" option (async batch)', async () => {
    let wrappedHandler1done = false

    const wrappedHandler1 = new MockHandler()
    wrappedHandler1.handle.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            wrappedHandler1done = true
            resolve()
          }, 20)
        })
    )

    const wrappedHandler2 = new MockHandler()
    wrappedHandler2.handle.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!wrappedHandler1done) {
              reject(
                new Error(
                  'Handler 2 finished before handler 1 despite sequential evaluation'
                )
              )
            } else {
              resolve()
            }
          }, 0)
        })
    )

    const handler = new GroupHandler([wrappedHandler1, wrappedHandler2], {
      sequential: true
    })

    await handler.handleBatch([record('debug', 'Test GroupHandler')])

    expect(wrappedHandler1.handle).toHaveBeenCalledTimes(1)
    expect(wrappedHandler2.handle).toHaveBeenCalledTimes(1)
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new GroupHandler([new MockHandler()])
    const nonBubblingHandler = new GroupHandler([new MockHandler()], {
      bubble: false
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBe(false)
    expect(nonBubblingHandler.handleSync(record('debug'))).toBe(true)
  })
})
