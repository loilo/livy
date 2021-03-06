const { ArrayHandler } = require('../src/array-handler')
const { DateTime } = require('luxon')

describe('@livy/array-handler', () => {
  it('should append log entries of the correct shape to the handler', () => {
    const handler = new ArrayHandler()

    handler.handleSync(record('info', 'Test ArrayHandler'))

    const records = handler.records
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      level: 'info',
      message: 'Test ArrayHandler',
      context: {},
      extra: {},
      channel: 'logs',
      datetime: expect.any(DateTime)
    })
  })

  it('should remove records on reset', () => {
    const handler = new ArrayHandler()

    handler.handleSync(record('info', 'Test ArrayHandler'))
    handler.reset()

    expect(handler.records).toHaveLength(0)
  })

  it('should efficiently batch handle records without calling "handleSync"', () => {
    const handler = new ArrayHandler()
    handler.handleSync = jest.fn()

    handler.handleBatchSync([
      record('debug', 'Test ArrayHandler'),
      record('info', 'Test ArrayHandler')
    ])

    expect(handler.records).toHaveLength(2)
    expect(handler.handleSync).not.toHaveBeenCalled()
  })

  it('should respect the "level" option', () => {
    const handler = new ArrayHandler({
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()

    expect(handler.records).toHaveLength(0)
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new ArrayHandler()
    const nonBubblingHandler = new ArrayHandler({
      bubble: false
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBeFalse()
    expect(nonBubblingHandler.handleSync(record('debug'))).toBeTrue()
  })
})
