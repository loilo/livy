import type { LogRecord } from '@livy/contracts'
import { AbstractBatchFormatter } from '@livy/util/formatters/abstract-batch-formatter'
import { isEmpty, omit } from '@livy/util/helpers'
import { HTML } from '@livy/util/html'
import { dump } from 'js-yaml'
import { lowlight } from 'lowlight'

import { toHtml as stringifyHtml } from 'hast-util-to-html'
import { u } from 'unist-builder'
import { map } from 'unist-util-map'
import { Span, Text } from 'lowlight/lib/core.js'

lowlight.registerLanguage(
  'yaml',
  (await import('highlight.js/lib/languages/yaml.js')).default,
)

/**
 * Formats log records as extensive HTML
 */
export class HtmlPrettyFormatter extends AbstractBatchFormatter {
  /**
   * @inheritdoc
   */
  protected batchDelimiter = ''

  /**
   * @inheritdoc
   */
  public format(record: LogRecord) {
    const colors = {
      background: '#fafbfd',
      text: '#363844',
      blue: '#08a1ed',
      darkBlue: '#11658F',
      gray: '#9195a2',
      green: '#2fae57',
      red: '#ff5c55',
      yellow: '#ce9c00',
    }

    const levelColor = (function getLevelColor() {
      switch (record.level) {
        case 'debug':
          return colors.gray
        case 'info':
        case 'notice':
          return colors.blue
        case 'warning':
          return colors.yellow
        case 'error':
          return colors.red
        case 'critical':
        case 'alert':
        case 'emergency':
          return colors.red
      }
    })()

    const boxShadowColor = (function getBoxShadowColor() {
      switch (record.level) {
        case 'debug':
          return `${colors.gray}44`
        case 'info':
          return `${colors.blue}aa`
        case 'notice':
          return `${colors.blue}`
        case 'warning':
          return `${colors.yellow}bb`
        case 'error':
          return `${colors.red}aa`
        case 'critical':
        case 'alert':
        case 'emergency':
          return `${colors.red}`
      }
    })()

    const serializedContext = this.formatData(record.context, true)
    const serializedExtra = this.formatData(record.extra, true)

    // prettier-ignore
    return HTML`
    <div role="listitem" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; color: ${colors.text}; background: ${colors.background}; padding: 0.75em 1em; border-radius: 0.125em; box-shadow: 0 0 0 1px ${colors.gray}33, 0 2px ${boxShadowColor}; margin-bottom: 0.75em">
      <time datetime="${record.datetime.toISO({ suppressMilliseconds: true })}" style="font-family: SFMono-Regular, Consolas, &quot;Liberation Mono&quot;, Menlo, Courier, monospace; color: ${colors.gray}; display: block; font-size: 0.8em; margin-bottom: 0.75em">${record.datetime.toFormat('yyyy-MM-dd HH:mm:ss')}</time>

      <span style="position: relative">
        <span>${record.message}</span>
        <span aria-hidden="true" style="position: absolute; left: 0; right: 0; bottom: -1px; height: 8px; background: ${levelColor}11"></span>
      </span>

      ${serializedContext || serializedExtra ? HTML`<hr style="background-color: ${colors.gray}55; border: none; height: 1px; margin: 1.25em 0 1em">` : ''}

      ${serializedContext ?  HTML`<div style="margin-left: 0.25em">
        <span style="color: ${colors.gray}; text-transform: uppercase; font-size: 0.6em; font-weight: 500; display: block; margin-bottom: 0.75em; margin-top: -1.2em">context</span>
        <output>
          <code style="font-family: SFMono-Regular, Consolas, &quot;Liberation Mono&quot;, Menlo, Courier, monospace; font-size: 0.9em; white-space: pre">${HTML(serializedContext)}</code>
        </output>
      </div>` : ''}
      ${serializedContext && serializedExtra ? HTML`<hr style="background-color: ${colors.gray}55; border: none; height: 1px; margin: 1.25em 0 1em">` : ''}
      ${serializedExtra ?  HTML`<div style="margin-left: 0.25em">
        <span style="color: ${colors.gray}; text-transform: uppercase; font-size: 0.6em; font-weight: 500; display: block; margin-bottom: 0.75em; margin-top: -1.2em">extra</span>
        <output>
          <code style="font-family: SFMono-Regular, Consolas, &quot;Liberation Mono&quot;, Menlo, Courier, monospace; font-size: 0.9em; white-space: pre">${HTML(serializedExtra)}</code>
        </output>
      </div>` : ''}

      ${serializedContext || serializedExtra ? HTML`<hr style="background-color: ${colors.gray}55; border: none; height: 1px; margin: 0.6em 0 1.25em">`: ''}

      <div role="list" style="font-family: SFMono-Regular, Consolas, &quot;Liberation Mono&quot;, Menlo, Courier, monospace; color: ${colors.gray}; display: block; font-size: 0.8em; margin-top: 1.25em">
        <span role="listitem">
          <span role="label" style="display: inline-block; font-weight: inherit">channel:</span>
          <span style="display: inline-block">${record.channel}</span></span>
          <span role="separator" style="color: ${colors.gray}55"> | </span>
          <span role="listitem">
          <span style="display: inline-block; font-weight: inherit">level:</span>
          <span style="display: inline-block">${record.level}</span>
        </span>
      </div>
    </div>`.toString()
  }

  /**
   * Serialize a piece of data
   *
   * @param data The data to serialize
   */
  protected serializeData(data: any) {
    const result = dump(data)

    return typeof result !== 'string' ? 'undefined' : result
  }

  /**
   * Format a single record property
   *
   * @param data        The data to format
   * @param ignoreEmpty Whether to return an empty serialization for empty data
   */
  protected formatData(data: any, ignoreEmpty = true) {
    if (ignoreEmpty && isEmpty(data)) {
      return ''
    } else {
      type StyleSpan = Omit<Span, 'properties'> & {
        properties: Omit<Span['properties'], 'className'> & {
          style: string
        }
      }

      const stringified = this.serializeData(data)
      const tree = lowlight.highlight('yaml', stringified).children as (
        | Text
        | Span
        | StyleSpan
      )[]

      const highlightedContextTree = map(u('root', tree), node => {
        if (
          node &&
          node.type === 'element' &&
          typeof node.properties === 'object' &&
          'className' in node.properties
        ) {
          const colors = {
            attr: '#11658F',
            string: '#ce9c00',
            number: '#ff5c55',
            literal: '#2fae57',
          }

          return {
            ...node,
            properties: {
              ...omit(node.properties, 'className'),
              style: node.properties.className
                .filter((className: string) => className.startsWith('hljs-'))
                .map((className: string) => {
                  const token = className.slice(5)

                  if (token in colors) {
                    return `color: ${colors[token as keyof typeof colors]}`
                  }
                })
                .filter(Boolean)
                .join('; '),
            },
          }
        } else {
          return node
        }
      })

      const formattedData = stringifyHtml(highlightedContextTree).toString()

      return `<span style="color: #9195a2">${formattedData}</span>`
    }
  }
}
