jest.mock('os')

const { JsonFormatter } = require('../src/json-formatter')

describe('@livy/json-formatter', () => {
  it('should include all parts by default', () => {
    const jsonFormatter = new JsonFormatter()

    const logRecord = record('info', 'Test JsonFormatter', {
      context: { foo: 1 },
      extra: { bar: 2 }
    })

    expect(jsonFormatter.format(logRecord)).toBe(JSON.stringify(logRecord))
  })

  it('should batch format correctly in newline mode', () => {
    const jsonFormatter = new JsonFormatter({
      batchMode: JsonFormatter.BATCH_MODE_NEWLINES
    })

    const record1 = record('info', 'Test JsonFormatter', {
      context: { foo: 1 },
      extra: { bar: 2 }
    })
    const record2 = record('info', 'Test JsonFormatter', {
      context: { foo: 1 },
      extra: { bar: 2 }
    })

    expect(jsonFormatter.formatBatch([record1, record2])).toBe(
      `${JSON.stringify(record1)}\n${JSON.stringify(record2)}`
    )
  })

  it('should batch format correctly in JSON mode', () => {
    const jsonFormatter = new JsonFormatter({
      batchMode: JsonFormatter.BATCH_MODE_JSON
    })

    const record1 = record('info', 'Test JsonFormatter', {
      context: { foo: 1 },
      extra: { bar: 2 }
    })
    const record2 = record('info', 'Test JsonFormatter', {
      context: { foo: 1 },
      extra: { bar: 2 }
    })

    expect(jsonFormatter.formatBatch([record1, record2])).toBe(
      JSON.stringify([record1, record2])
    )
  })

  it('should respect the "include" option', () => {
    const jsonFormatter = new JsonFormatter({
      include: {
        channel: false,
        level: false
      }
    })

    expect(jsonFormatter.include).toEqual({
      datetime: true,
      channel: false,
      level: false,
      severity: true,
      message: true,
      context: true,
      extra: true
    })

    const recordToFormat = record('info', 'Test JsonFormatter')

    expect(jsonFormatter.format(recordToFormat)).toBe(
      JSON.stringify(recordToFormat)
    )
  })
})
