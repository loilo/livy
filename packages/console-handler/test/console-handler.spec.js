import { ConsoleHandler } from '../src/console-handler'
import { MockConsole } from '../../../test/__helpers__/mock-console'

describe('@livy/console-handler', () => {
  it('should write logs to the configured console', () => {
    const mockConsole = new MockConsole()

    const handler = new ConsoleHandler({
      console: mockConsole
    })

    handler.handleSync(record('debug', 'Test ConsoleHandler'))
    handler.handleSync(record('info', 'Test ConsoleHandler'))
    handler.handleSync(record('notice', 'Test ConsoleHandler'))
    handler.handleSync(record('warning', 'Test ConsoleHandler'))
    handler.handleSync(record('error', 'Test ConsoleHandler'))
    handler.handleSync(record('critical', 'Test ConsoleHandler'))
    handler.handleSync(record('alert', 'Test ConsoleHandler'))
    handler.handleSync(record('emergency', 'Test ConsoleHandler'))

    // Only check whether logs were correctly mapped to the console
    // Actual contents should be tested in the according formatter tests
    expect(mockConsole.debug).toHaveBeenCalledTimes(0)
    expect(mockConsole.log).toHaveBeenCalledTimes(3)
    expect(mockConsole.info).toHaveBeenCalledTimes(0)
    expect(mockConsole.warn).toHaveBeenCalledTimes(1)
    expect(mockConsole.error).toHaveBeenCalledTimes(4)
  })

  it('should respect the "level" option', () => {
    const mockConsole = new MockConsole()

    const handler = new ConsoleHandler({
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

    const bubblingHandler = new ConsoleHandler({
      console: mockConsole
    })

    const nonBubblingHandler = new ConsoleHandler({
      bubble: false,
      console: mockConsole
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBeFalse()
    expect(nonBubblingHandler.handleSync(record('debug'))).toBeTrue()
  })
})
