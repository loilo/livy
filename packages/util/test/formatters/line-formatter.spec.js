import { describe, expect, it } from 'vitest'
import { LineFormatter } from '../../src/formatters/line-formatter'

const { record, TEST_CONSTANTS } = livyTestGlobals

describe('@livy/line-formatter', () => {
  it('should include all parts except channel by default', () => {
    const lineFormatter = new LineFormatter()
    expect(
      lineFormatter.format(
        record('info', 'Test LineFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        })
      )
    ).toBe(
      `${TEST_CONSTANTS.DATE_HUMAN} INFO Test LineFormatter {"foo":1} {"bar":2}`
    )
  })

  it('should omit the "extra" part completely if it\'s empty', () => {
    const lineFormatter = new LineFormatter()
    expect(lineFormatter.format(record('info', 'Test LineFormatter'))).toBe(
      `${TEST_CONSTANTS.DATE_HUMAN} INFO Test LineFormatter {}`
    )
  })

  it('should respect the "include" option', () => {
    const lineFormatter = new LineFormatter({
      include: {
        channel: true,
        severity: true
      }
    })

    expect(lineFormatter.include).toEqual({
      datetime: true,
      channel: true,
      level: true,
      severity: true,
      message: true,
      context: true,
      extra: true
    })

    expect(lineFormatter.format(record('info', 'Test LineFormatter'))).toBe(
      `${TEST_CONSTANTS.DATE_HUMAN} logs INFO [6] Test LineFormatter {}`
    )
  })

  it('should respect the "ignoreEmptyContext" option', () => {
    const lineFormatter = new LineFormatter({
      ignoreEmptyContext: true
    })

    expect(lineFormatter.format(record('info', 'Test LineFormatter'))).toBe(
      `${TEST_CONSTANTS.DATE_HUMAN} INFO Test LineFormatter`
    )

    expect(
      lineFormatter.format(
        record('info', 'Test LineFormatter', {
          extra: { bar: 2 }
        })
      )
    ).toBe(`${TEST_CONSTANTS.DATE_HUMAN} INFO Test LineFormatter {} {"bar":2}`)
  })

  it('should respect the "ignoreEmptyExtra" option', () => {
    const lineFormatter = new LineFormatter({
      ignoreEmptyExtra: false
    })

    expect(lineFormatter.format(record('info', 'Test LineFormatter'))).toBe(
      `${TEST_CONSTANTS.DATE_HUMAN} INFO Test LineFormatter {} {}`
    )
  })
})
