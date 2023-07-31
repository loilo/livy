import { describe, expect, it } from 'vitest'
import { NoopHandler } from '../src/noop-handler'

const { record } = livyTestGlobals

describe('@livy/noop-handler', () => {
  it('should report to handle all records', () => {
    const handler = new NoopHandler()
    expect(handler.isHandling(record('debug'))).toBe(true)
    expect(handler.isHandling(record('info'))).toBe(true)
    expect(handler.isHandling(record('notice'))).toBe(true)
    expect(handler.isHandling(record('warning'))).toBe(true)
    expect(handler.isHandling(record('error'))).toBe(true)
    expect(handler.isHandling(record('critical'))).toBe(true)
    expect(handler.isHandling(record('alert'))).toBe(true)
    expect(handler.isHandling(record('emergency'))).toBe(true)
  })

  it('should consume any records and still bubble', async () => {
    const handler = new NoopHandler()
    expect(handler.handleSync(record('info'))).toBe(false)
    expect(await handler.handle(record('info'))).toBe(false)
  })
})
