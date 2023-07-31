import { describe, expect, it } from 'vitest'
import { NullHandler } from '../src/null-handler'

const { record } = livyTestGlobals

describe('@livy/null-handler', () => {
  it('should discard all records with default settings', async () => {
    const handler = new NullHandler()

    expect(handler.handleSync(record('debug'))).toBe(true)
    expect(handler.handleSync(record('info'))).toBe(true)
    expect(handler.handleSync(record('notice'))).toBe(true)
    expect(handler.handleSync(record('warning'))).toBe(true)
    expect(handler.handleSync(record('error'))).toBe(true)
    expect(handler.handleSync(record('critical'))).toBe(true)
    expect(handler.handleSync(record('alert'))).toBe(true)
    expect(handler.handleSync(record('emergency'))).toBe(true)

    expect(await handler.handle(record('debug'))).toBe(true)
    expect(await handler.handle(record('info'))).toBe(true)
    expect(await handler.handle(record('notice'))).toBe(true)
    expect(await handler.handle(record('warning'))).toBe(true)
    expect(await handler.handle(record('error'))).toBe(true)
    expect(await handler.handle(record('critical'))).toBe(true)
    expect(await handler.handle(record('alert'))).toBe(true)
    expect(await handler.handle(record('emergency'))).toBe(true)
  })

  it('should respect the "level" option', () => {
    const handler = new NullHandler('notice')

    expect(handler.isHandling('debug')).toBe(false)
    expect(handler.isHandling('info')).toBe(false)
    expect(handler.isHandling('notice')).toBe(true)
    expect(handler.isHandling('warning')).toBe(true)
    expect(handler.isHandling('error')).toBe(true)
    expect(handler.isHandling('critical')).toBe(true)
    expect(handler.isHandling('alert')).toBe(true)
    expect(handler.isHandling('emergency')).toBe(true)
  })

  it('should bubble when "level" is not reached', async () => {
    const handler = new NullHandler('notice')

    expect(handler.handleSync(record('debug'))).toBe(false)
    expect(handler.handleSync(record('info'))).toBe(false)
    expect(handler.handleSync(record('notice'))).toBe(true)
    expect(handler.handleSync(record('warning'))).toBe(true)
    expect(handler.handleSync(record('error'))).toBe(true)
    expect(handler.handleSync(record('critical'))).toBe(true)
    expect(handler.handleSync(record('alert'))).toBe(true)
    expect(handler.handleSync(record('emergency'))).toBe(true)

    expect(await handler.handle(record('debug'))).toBe(false)
    expect(await handler.handle(record('info'))).toBe(false)
    expect(await handler.handle(record('notice'))).toBe(true)
    expect(await handler.handle(record('warning'))).toBe(true)
    expect(await handler.handle(record('error'))).toBe(true)
    expect(await handler.handle(record('critical'))).toBe(true)
    expect(await handler.handle(record('alert'))).toBe(true)
    expect(await handler.handle(record('emergency'))).toBe(true)
  })
})
