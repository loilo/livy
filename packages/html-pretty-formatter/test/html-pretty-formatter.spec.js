const { HtmlPrettyFormatter } = require('../src/html-pretty-formatter')

describe('@livy/html-pretty-formatter', () => {
  it('should format records correctly', () => {
    const htmlPrettyFormatter = new HtmlPrettyFormatter()

    const createRecord = record.with({
      message: 'Test HtmlPrettyFormatter',
      context: { foo: 1 },
      extra: { bar: 2 }
    })

    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'debug' }))
    ).toMatchSnapshot()
    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'info' }))
    ).toMatchSnapshot()
    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'notice' }))
    ).toMatchSnapshot()
    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'warning' }))
    ).toMatchSnapshot()
    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'error' }))
    ).toMatchSnapshot()
    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'critical' }))
    ).toMatchSnapshot()
    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'alert' }))
    ).toMatchSnapshot()
    expect(
      htmlPrettyFormatter.format(createRecord({ level: 'emergency' }))
    ).toMatchSnapshot()
  })

  it('should join batched formats with the empty string', () => {
    const htmlPrettyFormatter = new HtmlPrettyFormatter()
    expect(
      htmlPrettyFormatter.formatBatch([
        record('info', 'Test HtmlPrettyFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        }),
        record('info', 'Test HtmlPrettyFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        })
      ])
    ).toMatchSnapshot()
  })
})
