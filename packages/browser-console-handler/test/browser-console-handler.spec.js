/**
 * @jest-environment jsdom
 */

const { BrowserConsoleHandler } = require('../src/browser-console-handler')
const MockConsole = require('../../../test/__helpers__/mock-console')

describe('@livy/browser-console-handler', () => {
  it('should write highlighted logs to the configured console', () => {
    const browserRecord = record.with({
      message: 'Test BrowserConsoleHandler',
      context: { foo: true },
      extra: { bar: false }
    })

    const createRecordMatcher = level => [
      // Formatter string
      '%c%s%c',

      // Level styling
      expect.stringMatching(/^(background-)?color: /),

      // Level
      level.toUpperCase(),

      // Color resetter
      'color: inherit; background-color: inherit',

      // Message, context, extra
      'Test BrowserConsoleHandler',
      { foo: true },
      { bar: false }
    ]

    const mockConsole = new MockConsole()
    const handler = new BrowserConsoleHandler({ console: mockConsole })

    handler.handleSync(browserRecord({ level: 'debug' }))
    handler.handleSync(browserRecord({ level: 'info' }))
    handler.handleSync(browserRecord({ level: 'notice' }))
    handler.handleSync(browserRecord({ level: 'warning' }))
    handler.handleSync(browserRecord({ level: 'error' }))
    handler.handleSync(browserRecord({ level: 'critical' }))
    handler.handleSync(browserRecord({ level: 'alert' }))
    handler.handleSync(browserRecord({ level: 'emergency' }))

    // console.debug()
    expect(mockConsole.debug).not.toHaveBeenCalled()

    // console.log()
    expect(mockConsole.log).toHaveBeenCalledTimes(1)
    expect(mockConsole.log).toHaveBeenNthCalledWith(
      1,
      ...createRecordMatcher('debug')
    )

    // console.info()
    expect(mockConsole.info).toHaveBeenCalledTimes(2)
    expect(mockConsole.info).toHaveBeenNthCalledWith(
      1,
      ...createRecordMatcher('info')
    )
    expect(mockConsole.info).toHaveBeenNthCalledWith(
      2,
      ...createRecordMatcher('notice')
    )

    // console.warn()
    expect(mockConsole.warn).toHaveBeenCalledTimes(1)
    expect(mockConsole.warn).toHaveBeenNthCalledWith(
      1,
      ...createRecordMatcher('warning')
    )

    // console.error()
    expect(mockConsole.error).toHaveBeenCalledTimes(4)
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      1,
      ...createRecordMatcher('error')
    )
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      2,
      ...createRecordMatcher('critical')
    )
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      3,
      ...createRecordMatcher('alert')
    )
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      4,
      ...createRecordMatcher('emergency')
    )
  })

  it('should respect the "useNativeDebug" option', () => {
    const mockConsole = new MockConsole()

    const handler = new BrowserConsoleHandler({
      useNativeDebug: true,
      console: mockConsole
    })

    handler.handleSync(record('debug', 'Test BrowserConsoleHandler'))

    expect(mockConsole.debug).toHaveBeenCalledTimes(1)
    expect(mockConsole.log).not.toHaveBeenCalled()
  })

  it('should respect the "timestamps" option', () => {
    const mockConsole = new MockConsole()

    const handler = new BrowserConsoleHandler({
      timestamps: true,
      console: mockConsole
    })

    handler.handleSync(record('debug', 'Test BrowserConsoleHandler'))

    expect(mockConsole.log).toHaveBeenCalledTimes(1)
    expect(mockConsole.log).toHaveBeenNthCalledWith(
      1,
      // Formatter string
      '%c%s%c %c%s%c',

      // Timestamp styling
      expect.stringMatching(/^(background-)?color: /),

      // Timestamp
      expect.stringMatching(/^[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}$/),

      // Color resetter
      'color: inherit; background-color: inherit',

      // Level styling
      expect.stringMatching(/^(background-)?color: /),

      // Level
      'DEBUG',

      // Color resetter
      'color: inherit; background-color: inherit',

      // Message, context, extra
      'Test BrowserConsoleHandler'
    )
  })

  it('should respect the "level" option', () => {
    const mockConsole = new MockConsole()

    const handler = new BrowserConsoleHandler({
      level: 'notice',
      console: mockConsole
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()

    handler.handleSync(record('info'))
    expect(mockConsole.__hasBeenCalled()).toBeFalse()
  })

  it('should respect the "bubble" option', () => {
    const mockConsole = new MockConsole()

    const bubblingHandler = new BrowserConsoleHandler({
      console: mockConsole
    })

    const nonBubblingHandler = new BrowserConsoleHandler({
      bubble: false,
      console: mockConsole
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBeFalse()
    expect(nonBubblingHandler.handleSync(record('debug'))).toBeTrue()
  })
})
