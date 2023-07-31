import { describe, expect, it, vi } from 'vitest'
import { ConsoleFormatter } from '../src/console-formatter'

vi.mock(
  'chalk',
  livyTestGlobals.getMockedModule(
    import('@livy/test-utils/mocks/modules/chalk.js'),
  ),
)

const { record } = livyTestGlobals

describe('@livy/console-formatter', () => {
  it('should format records correctly', () => {
    const consoleFormatter = new ConsoleFormatter()

    const createRecord = record.with({
      message: 'Test ConsoleFormatter',
      context: { foo: 1 },
      extra: { bar: 2 },
    })

    expect(
      consoleFormatter.format(createRecord({ level: 'debug' })),
    ).toMatchSnapshot()
    expect(
      consoleFormatter.format(createRecord({ level: 'info' })),
    ).toMatchSnapshot()
    expect(
      consoleFormatter.format(createRecord({ level: 'notice' })),
    ).toMatchSnapshot()
    expect(
      consoleFormatter.format(
        createRecord({
          level: 'warning',
        }),
      ),
    ).toMatchSnapshot()
    expect(
      consoleFormatter.format(
        createRecord({
          recordWithContextAndExtra: createRecord,
          level: 'error',
        }),
      ),
    ).toMatchSnapshot()
    expect(
      consoleFormatter.format(
        createRecord({
          level: 'critical',
        }),
      ),
    ).toMatchSnapshot()
    expect(
      consoleFormatter.format(createRecord({ level: 'alert' })),
    ).toMatchSnapshot()
    expect(
      consoleFormatter.format(
        createRecord({
          level: 'emergency',
        }),
      ),
    ).toMatchSnapshot()
  })

  it('should preserve "null" and "undefined" values in context', () => {
    const consoleFormatter = new ConsoleFormatter()
    expect(
      consoleFormatter.format(
        record('debug', 'Test ConsoleFormatter', {
          context: {
            a: 1,
            b: undefined,
            c: null,
            d: [null],
            e: { f: undefined },
          },
        }),
      ),
    ).toMatchSnapshot()
  })

  it('should skip unserializable context data', () => {
    const consoleFormatter = new ConsoleFormatter()
    expect(
      consoleFormatter.format(
        record('debug', 'Test ConsoleFormatter', {
          context: { fn() {} },
        }),
      ),
    ).toMatchSnapshot()
  })

  it('should respect the provided color support', () => {
    const decoratedConsoleFormatter = new ConsoleFormatter({ decorated: true })
    expect(
      decoratedConsoleFormatter.format(
        record('debug', 'Test ConsoleFormatter'),
      ),
    ).toMatchSnapshot()

    const undecoratedConsoleFormatter = new ConsoleFormatter({
      decorated: true,
    })
    expect(
      undecoratedConsoleFormatter.format(
        record('debug', 'Test ConsoleFormatter'),
      ),
    ).toMatchSnapshot()
  })
})
