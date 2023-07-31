import { describe, expect, it } from 'vitest'
import { HtmlOnelineFormatter } from '../src/html-oneline-formatter'

const { record } = livyTestGlobals

describe('@livy/html-oneline-formatter', () => {
  it('should include all parts except channel by default', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter()
    expect(
      htmlOnelineFormatter.format(
        record('info', 'Test HtmlOnelineFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        })
      )
    ).toMatchSnapshot()
  })

  it('should join batched formats with the empty string', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter()
    expect(
      htmlOnelineFormatter.formatBatch([
        record('info', 'Test HtmlOnelineFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        }),
        record('info', 'Test HtmlOnelineFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        })
      ])
    ).toMatchSnapshot()
  })

  it('should omit the "extra" part completely if it\'s empty', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter()
    expect(
      htmlOnelineFormatter.format(record('info', 'Test HtmlOnelineFormatter'))
    ).toMatchSnapshot()
  })

  it('should respect the "include" option', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter({
      include: {
        channel: true,
        severity: true
      }
    })

    expect(htmlOnelineFormatter.include).toEqual({
      datetime: true,
      channel: true,
      level: true,
      severity: true,
      message: true,
      context: true,
      extra: true
    })

    expect(
      htmlOnelineFormatter.format(record('info', 'Test HtmlOnelineFormatter'))
    ).toMatchSnapshot()
  })

  it('should return an empty line when no properties are included', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter({
      include: {
        datetime: false,
        channel: false,
        level: false,
        severity: false,
        message: false,
        context: false,
        extra: false
      }
    })

    expect(
      htmlOnelineFormatter.format(record('info', 'Test HtmlOnelineFormatter'))
    ).toMatch(/<pre[^>]*>\s*<\/pre>/)
  })

  it('should respect the "wrap" option', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter({
      wrap: true
    })

    expect(
      htmlOnelineFormatter.format(record('info', 'Test HtmlOnelineFormatter'))
    ).toMatchSnapshot()
  })

  it('should respect the "theme" option', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter({
      include: {
        severity: true
      },
      theme: {
        text: 'black',
        punctuation: 'gray',
        level_emergency: 'darkred',
        level_alert: 'crimson',
        level_critical: 'indianred',
        level_error: 'lightcoral',
        level_warning: 'gold',
        level_notice: 'steelblue',
        level_info: 'dodgerblue',
        level_debug: 'lightskyblue',
        data_key: 'inherit',
        data_value_string: 'mediumseagreen',
        data_value_number: 'darkslateblue',
        data_value_literal: 'sandybrown'
      }
    })

    expect(
      htmlOnelineFormatter.format(
        record('info', 'Test HtmlOnelineFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        })
      )
    ).toMatchSnapshot()
  })

  it('should omit punctuation wrapper elements if punctuation color is "inherit"', () => {
    const htmlOnelineFormatter = new HtmlOnelineFormatter({
      theme: {
        text: 'black',
        punctuation: 'inherit',
        level_emergency: 'darkred',
        level_alert: 'crimson',
        level_critical: 'indianred',
        level_error: 'lightcoral',
        level_warning: 'gold',
        level_notice: 'steelblue',
        level_info: 'dodgerblue',
        level_debug: 'lightskyblue',
        data_key: 'inherit',
        data_value_string: 'mediumseagreen',
        data_value_number: 'darkslateblue',
        data_value_literal: 'sandybrown'
      }
    })

    expect(
      htmlOnelineFormatter.format(
        record('info', 'Test HtmlOnelineFormatter', {
          context: { foo: 1 },
          extra: { bar: 2 }
        })
      )
    ).toMatchSnapshot()
  })
})
