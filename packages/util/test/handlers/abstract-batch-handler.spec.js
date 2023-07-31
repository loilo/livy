import { describe, expect, it, vi } from 'vitest'
import { AbstractBatchHandler } from '../../src/handlers/abstract-batch-handler'

const { record } = livyTestGlobals

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('@livy/util/lib/handlers/abstract-batch-handler', () => {
  it('should batch "handle" method in order', async () => {
    class Handler extends AbstractBatchHandler {
      constructor() {
        super()
        let first = true

        this.handle = vi.fn(() => {
          if (first) {
            first = false
            return delay(50)
          }
        })
      }
    }

    const handler = new Handler()
    await handler.handleBatch([
      record('debug'),
      record('info'),
      record('notice')
    ])

    expect(handler.handle).toHaveBeenCalledTimes(3)
    expect(handler.handle).toHaveBeenNthCalledWith(1, record('debug'))
    expect(handler.handle).toHaveBeenNthCalledWith(2, record('info'))
    expect(handler.handle).toHaveBeenNthCalledWith(3, record('notice'))
  })

  it('should batch the "handleSync" method', () => {
    class Handler extends AbstractBatchHandler {
      constructor() {
        super()
        this.handleSync = vi.fn()
      }
    }

    const handler = new Handler()
    handler.handleBatchSync([record('debug'), record('info'), record('notice')])

    expect(handler.handleSync).toHaveBeenCalledTimes(3)
    expect(handler.handleSync).toHaveBeenNthCalledWith(1, record('debug'))
    expect(handler.handleSync).toHaveBeenNthCalledWith(2, record('info'))
    expect(handler.handleSync).toHaveBeenNthCalledWith(3, record('notice'))
  })

  it('should fail to synchronously batch-handle an async handler', () => {
    class Handler extends AbstractBatchHandler {
      constructor() {
        super()
        this.handle = vi.fn()
      }
    }

    const handler = new Handler()

    expect(() => {
      handler.handleBatchSync([
        record('debug'),
        record('info'),
        record('notice')
      ])
    }).toThrowError(
      new Error('Cannot invoke handleBatchSync() on an asynchronous handler')
    )
  })
})
