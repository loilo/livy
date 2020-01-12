const chalk = require('chalk')
const { AnsiLineFormatter } = require('../src/ansi-line-formatter')

describe('@livy/ansi-line-formatter', () => {
  beforeEach(() => {
    chalk.supportsColor = true
  })

  afterEach(() => {
    chalk.__reset()
  })

  it('should correctly derive color support from chalk', () => {
    chalk.supportsColor = true
    expect(new AnsiLineFormatter().shouldDecorate()).toBeTrue()
    chalk.supportsColor = false
    expect(new AnsiLineFormatter().shouldDecorate()).toBeFalse()
  })

  it('should respect the "decorated" option', () => {
    chalk.supportsColor = true
    expect(new AnsiLineFormatter({ decorated: false }).shouldDecorate()).toBe(
      false
    )
    chalk.supportsColor = false
    expect(new AnsiLineFormatter({ decorated: true }).shouldDecorate()).toBe(
      true
    )
  })

  it('should format records correctly without decoration', () => {
    const ansiLineFormatter = new AnsiLineFormatter({
      decorated: false,
      include: { channel: true }
    })

    const createRecord = record.with({
      message: 'Test AnsiLineFormatter',
      context: { foo: 1 },
      extra: { bar: 2 }
    })

    expect(
      ansiLineFormatter.format(createRecord({ level: 'debug' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'info' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'notice' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'warning' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'error' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'critical' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'alert' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'emergency' }))
    ).toMatchSnapshot()
  })

  it('should decorate records correctly', () => {
    const ansiLineFormatter = new AnsiLineFormatter({
      decorated: true,
      include: { channel: true }
    })

    const createRecord = record.with({
      message: 'Test LineFormatter',
      context: { foo: 1 },
      extra: { bar: 2 }
    })

    expect(
      ansiLineFormatter.format(createRecord({ level: 'debug' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'info' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'notice' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'warning' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'error' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'critical' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'alert' }))
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'emergency' }))
    ).toMatchSnapshot()
  })
})
