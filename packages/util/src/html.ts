import { escapeHtmlEntities } from './helpers'

const HTMLRawMarker = Symbol('HTML raw marker')

/**
 * Represents a chunk of stringifiable HTML
 */
export interface HTMLChunk {
  [HTMLRawMarker]: true
  toString(): string
}

/**
 * HTMLMask('...') masks a string as an HTML chunk so it will not be escaped
 * You don't need to call this function manually, use HTML() instead.
 */
function HTMLMask(value: string) {
  return {
    [HTMLRawMarker]: true as const,
    toString() {
      return value
    }
  }
}

/**
 * A template tag for escaping embedded pieces of HTML
 *
 * @example
 * HTML`<p>Markup is ${'<em>awesome</em>'}!</p>`.toString()
 * // '<p>Markup is &lt;em&gt;awesome&lt;/em&gt;!</p>'
 *
 * @example
 * HTML`<p>Markup is ${HTML`<em>awesome</em>`}!</p>`.toString()
 * // '<p>Markup is <em>awesome</em>!</p>'
 *
 * @example
 * HTML`<p>Markup is ${HTML('<em>awesome</em>')}!</p>`.toString()
 * // '<p>Markup is <em>awesome</em>!</p>'
 */
export function HTML(string: string): HTMLChunk
export function HTML(strings: TemplateStringsArray, ...keys: any[]): HTMLChunk
export function HTML(...args: any[]): HTMLChunk {
  if (typeof args[0] === 'string') {
    return HTMLMask(args[0])
  } else {
    const [strings, ...keys] = args as [TemplateStringsArray, ...any[]]

    return HTMLMask(
      strings.slice(1).reduce((carry, string, index) => {
        const data = keys[index]

        return carry.concat(
          typeof data === 'object' && data !== null && HTMLRawMarker in data
            ? String(data)
            : escapeHtmlEntities(String(data)),
          string
        )
      }, strings[0])
    )
  }
}
