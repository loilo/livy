const { NullHandler } = require('../src/null-handler')

describe('@livy/null-handler', () => {
  it('should discard all records with default settings', async () => {
    const handler = new NullHandler()

    expect(handler.handleSync(record('debug'))).toBeTrue()
    expect(handler.handleSync(record('info'))).toBeTrue()
    expect(handler.handleSync(record('notice'))).toBeTrue()
    expect(handler.handleSync(record('warning'))).toBeTrue()
    expect(handler.handleSync(record('error'))).toBeTrue()
    expect(handler.handleSync(record('critical'))).toBeTrue()
    expect(handler.handleSync(record('alert'))).toBeTrue()
    expect(handler.handleSync(record('emergency'))).toBeTrue()

    expect(await handler.handle(record('debug'))).toBeTrue()
    expect(await handler.handle(record('info'))).toBeTrue()
    expect(await handler.handle(record('notice'))).toBeTrue()
    expect(await handler.handle(record('warning'))).toBeTrue()
    expect(await handler.handle(record('error'))).toBeTrue()
    expect(await handler.handle(record('critical'))).toBeTrue()
    expect(await handler.handle(record('alert'))).toBeTrue()
    expect(await handler.handle(record('emergency'))).toBeTrue()
  })

  it('should respect the "level" option', () => {
    const handler = new NullHandler('notice')

    expect(handler.isHandling('debug')).toBeFalse()
    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()
    expect(handler.isHandling('warning')).toBeTrue()
    expect(handler.isHandling('error')).toBeTrue()
    expect(handler.isHandling('critical')).toBeTrue()
    expect(handler.isHandling('alert')).toBeTrue()
    expect(handler.isHandling('emergency')).toBeTrue()
  })

  it('should bubble when "level" is not reached', async () => {
    const handler = new NullHandler('notice')

    expect(handler.handleSync(record('debug'))).toBeFalse()
    expect(handler.handleSync(record('info'))).toBeFalse()
    expect(handler.handleSync(record('notice'))).toBeTrue()
    expect(handler.handleSync(record('warning'))).toBeTrue()
    expect(handler.handleSync(record('error'))).toBeTrue()
    expect(handler.handleSync(record('critical'))).toBeTrue()
    expect(handler.handleSync(record('alert'))).toBeTrue()
    expect(handler.handleSync(record('emergency'))).toBeTrue()

    expect(await handler.handle(record('debug'))).toBeFalse()
    expect(await handler.handle(record('info'))).toBeFalse()
    expect(await handler.handle(record('notice'))).toBeTrue()
    expect(await handler.handle(record('warning'))).toBeTrue()
    expect(await handler.handle(record('error'))).toBeTrue()
    expect(await handler.handle(record('critical'))).toBeTrue()
    expect(await handler.handle(record('alert'))).toBeTrue()
    expect(await handler.handle(record('emergency'))).toBeTrue()
  })
})
