import { NoopHandler } from '../src/noop-handler'

describe('@livy/noop-handler', () => {
  it('should report to handle all records', () => {
    const handler = new NoopHandler()
    expect(handler.isHandling(record('debug'))).toBeTrue()
    expect(handler.isHandling(record('info'))).toBeTrue()
    expect(handler.isHandling(record('notice'))).toBeTrue()
    expect(handler.isHandling(record('warning'))).toBeTrue()
    expect(handler.isHandling(record('error'))).toBeTrue()
    expect(handler.isHandling(record('critical'))).toBeTrue()
    expect(handler.isHandling(record('alert'))).toBeTrue()
    expect(handler.isHandling(record('emergency'))).toBeTrue()
  })

  it('should consume any records and still bubble', async () => {
    const handler = new NoopHandler()
    expect(handler.handleSync(record('info'))).toBeFalse()
    expect(await handler.handle(record('info'))).toBeFalse()
  })
})
