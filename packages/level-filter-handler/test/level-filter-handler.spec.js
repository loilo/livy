import { describe, expect, it, vi } from 'vitest'
import { LevelFilterHandler } from '../src/level-filter-handler'

const { record, MockHandler } = livyTestGlobals

describe('@livy/level-filter-handler', () => {
  it('should pass all records with no min/max level configured', () => {
    const wrappedHandler = new MockHandler()
    const handler = new LevelFilterHandler(wrappedHandler)

    handler.handleSync(record('debug', 'Test LevelFilterHandler'))
    handler.handleSync(record('info', 'Test LevelFilterHandler'))
    handler.handleSync(record('notice', 'Test LevelFilterHandler'))
    handler.handleSync(record('warning', 'Test LevelFilterHandler'))
    handler.handleSync(record('error', 'Test LevelFilterHandler'))
    handler.handleSync(record('critical', 'Test LevelFilterHandler'))
    handler.handleSync(record('alert', 'Test LevelFilterHandler'))
    handler.handleSync(record('emergency', 'Test LevelFilterHandler'))

    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(8)
  })

  it('should block records below the min level', () => {
    const wrappedHandler = new MockHandler()
    const handler = new LevelFilterHandler(wrappedHandler, {
      minLevel: 'notice'
    })

    const noticeRecord = record('notice', 'Test LevelFilterHandler')
    handler.handleSync(record('debug', 'Test LevelFilterHandler'))
    handler.handleSync(record('info', 'Test LevelFilterHandler'))
    handler.handleSync(noticeRecord)
    handler.handleSync(record('warning', 'Test LevelFilterHandler'))
    handler.handleSync(record('error', 'Test LevelFilterHandler'))
    handler.handleSync(record('critical', 'Test LevelFilterHandler'))
    handler.handleSync(record('alert', 'Test LevelFilterHandler'))
    handler.handleSync(record('emergency', 'Test LevelFilterHandler'))

    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(6)
    expect(wrappedHandler.handleSync).toHaveBeenNthCalledWith(1, noticeRecord)
  })

  it('should block records above the max level', () => {
    const wrappedHandler = new MockHandler()
    const handler = new LevelFilterHandler(wrappedHandler, {
      maxLevel: 'warning'
    })

    const warningRecord = record('warning', 'Test LevelFilterHandler')

    handler.handleSync(record('debug', 'Test LevelFilterHandler'))
    handler.handleSync(record('info', 'Test LevelFilterHandler'))
    handler.handleSync(record('notice', 'Test LevelFilterHandler'))
    handler.handleSync(warningRecord)
    handler.handleSync(record('error', 'Test LevelFilterHandler'))
    handler.handleSync(record('critical', 'Test LevelFilterHandler'))
    handler.handleSync(record('alert', 'Test LevelFilterHandler'))
    handler.handleSync(record('emergency', 'Test LevelFilterHandler'))

    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(4)
    expect(wrappedHandler.handleSync).toHaveBeenLastCalledWith(warningRecord)
  })

  it('should block records outside the min/max level', () => {
    const wrappedHandler = new MockHandler()
    const handler = new LevelFilterHandler(wrappedHandler, {
      minLevel: 'notice',
      maxLevel: 'warning'
    })

    const noticeRecord = record('notice', 'Test LevelFilterHandler')
    const warningRecord = record('warning', 'Test LevelFilterHandler')

    handler.handleSync(record('debug', 'Test LevelFilterHandler'))
    handler.handleSync(record('info', 'Test LevelFilterHandler'))
    handler.handleSync(noticeRecord)
    handler.handleSync(warningRecord)
    handler.handleSync(record('error', 'Test LevelFilterHandler'))
    handler.handleSync(record('critical', 'Test LevelFilterHandler'))
    handler.handleSync(record('alert', 'Test LevelFilterHandler'))
    handler.handleSync(record('emergency', 'Test LevelFilterHandler'))

    expect(wrappedHandler.handleSync).toHaveBeenCalledTimes(2)
    expect(wrappedHandler.handleSync).toHaveBeenNthCalledWith(1, noticeRecord)
    expect(wrappedHandler.handleSync).toHaveBeenNthCalledWith(2, warningRecord)
  })

  it('should report accepted levels', () => {
    expect(
      new LevelFilterHandler(new MockHandler(), {
        maxLevel: 'warning'
      }).getAcceptedLevels()
    ).toEqual(['debug', 'info', 'notice', 'warning'])

    expect(
      new LevelFilterHandler(new MockHandler(), {
        minLevel: 'warning'
      }).getAcceptedLevels()
    ).toEqual(['warning', 'error', 'critical', 'alert', 'emergency'])

    expect(
      new LevelFilterHandler(new MockHandler(), {
        minLevel: 'notice',
        maxLevel: 'error'
      }).getAcceptedLevels()
    ).toEqual(['notice', 'warning', 'error'])
  })

  it('should report to bubble when a record is not handled', async () => {
    const wrappedHandler = new MockHandler()
    const handler = new LevelFilterHandler(wrappedHandler, {
      minLevel: 'notice',
      bubble: false
    })

    expect(handler.handleSync(record('debug'))).toBe(false)
    expect(await handler.handle(record('debug'))).toBe(false)
  })

  it('should filter records in batch handling', async () => {
    const wrappedHandler = new MockHandler()
    const handler = new LevelFilterHandler(wrappedHandler, {
      minLevel: 'notice',
      maxLevel: 'warning'
    })

    handler.handleBatchSync([
      record('info', 'Test LevelFilterHandler'),
      record('notice', 'Test LevelFilterHandler')
    ])

    await handler.handleBatch([
      record('info', 'Test LevelFilterHandler'),
      record('notice', 'Test LevelFilterHandler')
    ])

    expect(wrappedHandler.handleBatch).toHaveBeenCalledTimes(1)
    expect(wrappedHandler.handleBatch).toHaveBeenLastCalledWith([
      record('notice', 'Test LevelFilterHandler')
    ])

    expect(wrappedHandler.handleBatchSync).toHaveBeenCalledTimes(1)
    expect(wrappedHandler.handleBatchSync).toHaveBeenLastCalledWith([
      record('notice', 'Test LevelFilterHandler')
    ])
  })

  it('should fail to activate async handlers in sync environment', () => {
    const handler = new LevelFilterHandler(new MockHandler({ sync: false }))

    expect(() => {
      handler.handleSync(record('warning', 'Test LevelFilterHandler'))
    }).toThrowError(
      new Error('Cannot activate asynchronous handler in sync mode')
    )

    expect(() => {
      handler.handleBatchSync([record('warning', 'Test LevelFilterHandler')])
    }).toThrowError(
      new Error('Cannot activate asynchronous handler in sync mode')
    )
  })

  it('should reset processors on reset', () => {
    const processor = {
      process: x => x,
      reset: vi.fn()
    }

    const handler = new LevelFilterHandler(new MockHandler())
    handler.processors.add(processor)
    expect(processor.reset).not.toHaveBeenCalled()

    handler.reset()
    expect(processor.reset).toHaveBeenCalledTimes(1)
  })

  it('should invoke reset on wrapped handler when applicable', () => {
    const wrappedHandler = new MockHandler({ resettable: true })
    const handler = new LevelFilterHandler(wrappedHandler)

    handler.reset()

    expect(wrappedHandler.reset).toHaveBeenCalledTimes(1)
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new LevelFilterHandler(new MockHandler())
    const nonBubblingHandler = new LevelFilterHandler(new MockHandler(), {
      bubble: false
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBe(false)
    expect(nonBubblingHandler.handleSync(record('debug'))).toBe(true)
  })

  it('should respect the "bubble" option (async)', async () => {
    const bubblingHandler = new LevelFilterHandler(new MockHandler())
    const nonBubblingHandler = new LevelFilterHandler(new MockHandler(), {
      bubble: false
    })

    expect(await bubblingHandler.handle(record('debug'))).toBe(false)
    expect(await nonBubblingHandler.handle(record('debug'))).toBe(true)
  })
})
