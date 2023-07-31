import { describe, expect, it } from 'vitest'
import { MockConsole } from '@livy/test-utils/mocks/mock-console.js'
import { ConsoleHandler } from '../src/console-handler'

const { record } = livyTestGlobals

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

    expect(handler.isHandling('info')).toBe(false)
    expect(handler.isHandling('notice')).toBe(true)

    handler.handleSync(record('info'))
    expect(mockConsole.__hasBeenCalled()).toBe(false)
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

    expect(bubblingHandler.handleSync(record('debug'))).toBe(false)
    expect(nonBubblingHandler.handleSync(record('debug'))).toBe(true)
  })
})
