import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import chalk, { supportsColor } from 'chalk'

vi.mock(
  'chalk',
  livyTestGlobals.getMockedModule(
    import('@livy/test-utils/mocks/modules/chalk.js'),
  ),
)

import { AnsiLineFormatter } from '../src/ansi-line-formatter'

const { record } = livyTestGlobals

describe('@livy/ansi-line-formatter', () => {
  beforeEach(() => {
    supportsColor.hasBasic = true
  })

  afterEach(() => {
    chalk.__reset()
  })

  it('should correctly derive color support from chalk', () => {
    supportsColor.hasBasic = true
    expect(new AnsiLineFormatter().shouldDecorate()).toBe(true)
    supportsColor.hasBasic = false
    expect(new AnsiLineFormatter().shouldDecorate()).toBe(false)
  })

  it('should respect the "decorated" option', () => {
    supportsColor.hasBasic = true
    expect(new AnsiLineFormatter({ decorated: false }).shouldDecorate()).toBe(
      false,
    )
    supportsColor.hasBasic = false
    expect(new AnsiLineFormatter({ decorated: true }).shouldDecorate()).toBe(
      true,
    )
  })

  it('should format records correctly without decoration', () => {
    const ansiLineFormatter = new AnsiLineFormatter({
      decorated: false,
      include: { channel: true },
    })

    const createRecord = record.with({
      message: 'Test AnsiLineFormatter',
      context: { foo: 1 },
      extra: { bar: 2 },
    })

    expect(
      ansiLineFormatter.format(createRecord({ level: 'debug' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'info' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'notice' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'warning' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'error' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'critical' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'alert' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'emergency' })),
    ).toMatchSnapshot()
  })

  it('should decorate records correctly', () => {
    const ansiLineFormatter = new AnsiLineFormatter({
      decorated: true,
      include: { channel: true },
    })

    const createRecord = record.with({
      message: 'Test LineFormatter',
      context: { foo: 1 },
      extra: { bar: 2 },
    })

    expect(
      ansiLineFormatter.format(createRecord({ level: 'debug' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'info' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'notice' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'warning' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'error' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'critical' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'alert' })),
    ).toMatchSnapshot()
    expect(
      ansiLineFormatter.format(createRecord({ level: 'emergency' })),
    ).toMatchSnapshot()
  })
})
