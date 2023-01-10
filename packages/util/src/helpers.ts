import { AnyObject, Primitive } from './types'

/**
 * Sanitize function, removes special regex characters from a string.
 * -> Creates a literal part of a RegExp
 * So you can do this without worrying about special chars:
 *
 * @example
 * new RegExp(sanitizeRegex(anyString))
 */
export function sanitizeRegex(value: string) {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

/**
 * Replace %tokens% in a template
 *
 * @param template The template to handle
 * @param values   Values to replace in the template when wrapped in % characters
 *
 * @example
 * replaceTokens('Hello %name%!', {
 *   name: 'World'
 * })
 * // 'Hello World!'
 *
 * @example
 * replaceTokens('%unknown-token%', {}) // '%unknown-token%'
 */
export function replaceTokens(template: string, values: AnyObject) {
  const patternRegex = new RegExp(
    `%(${Object.keys(values).map(sanitizeRegex).join('|')})%`,
    'g'
  )
  return template.replace(patternRegex, (_, token) => values[token])
}

/**
 * Remove HTML tags from a string
 *
 * @param value The string to sanitize
 *
 * @example
 * stripTags('Hello <strong>World</strong>!') // 'Hello World!'
 */
export function stripTags(value: string) {
  return value.replace(/(<([^>]+)>)/gi, '')
}

/**
 * Escape HTML entities in a string
 *
 * @param value The string to sanitize
 *
 * @example
 * escapeHtmlEntities('foo & bar') // 'foo &amp; bar'
 */
export function escapeHtmlEntities(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Take an object and return the same object with one or more properties removed from it
 *
 * @param object     The object to reduce
 * @param properties The properties to remove from the object
 *
 * @example
 * omit({ a: 1, b: 2, c: 3 }, 'b', 'c')
 * // { a: 1 }
 */
export function omit<T extends AnyObject, U extends Array<keyof T>>(
  object: T,
  ...properties: U
): Omit<T, U[number]>
export function omit<T extends AnyObject, U extends string[]>(
  object: T,
  ...properties: U
): T & { [key: string]: any }
export function omit<T extends AnyObject, U extends any[]>(
  object: T,
  ...properties: U
): Omit<T, never> {
  const copy = { ...object }
  for (const property of properties) {
    delete copy[property]
  }
  return copy
}

/**
 * Check whether a value is empty (i.e. null, undefined, empty string, empty array, empty plain object)
 *
 * @param value The value to check
 */
export function isEmpty(value: unknown) {
  if (value == null) {
    return true
  }

  if (typeof value === 'string') {
    return value.length === 0
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value)

    return (
      (prototype === Object.prototype || prototype === null) &&
      Object.keys(value!).length === 0
    )
  }

  return false
}

/**
 * Capitalize the first letter of a string
 *
 * @param value The string to capitalize
 *
 * @example
 * capitalizeFirstLetter('hello world') // 'Hello world'
 * capitalizeFirstLetter('Hello world') // 'Hello world'
 * capitalizeFirstLetter('...') // '...'
 */
export function capitalizeFirstLetter(value: string) {
  if (value.length === 0) {
    return value
  }

  return value[0].toUpperCase() + value.slice(1)
}

/**
 * Check whether a value is a primitive
 *
 * @param value The value to type-check
 */
export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    ['undefined', 'string', 'number', 'boolean', 'symbol', 'bigint'].includes(
      typeof value
    )
  )
}

/**
 * Get an obvious type name for a value
 *
 * @param value The value to type-check
 */
export function getObviousTypeName(value: unknown) {
  if (value === null) {
    return 'null'
  } else if (Array.isArray(value)) {
    return 'array'
  } else {
    return typeof value
  }
}

/**
 * Check whether a value is promise-like
 *
 * @param value The value to check
 */
export function isPromiseLike(value: unknown): value is PromiseLike<any> {
  return value != null && typeof (value as any).then === 'function'
}

/**
 * Check whether a value is a Promise
 *
 * @param value The value to check
 */
export function isPromise(value: unknown): value is Promise<any> {
  return isPromiseLike(value) && typeof (value as any).catch === 'function'
}

/**
 * Returns an object created by key-value entries for properties and methods
 * @param entries An iterable object that contains key-value entries for properties and methods.
 *
 * @example
 * fromEntries([['a', 1], ['b' 2]])
 * // { a: 1, b: 2 }
 */
export function fromEntries<T = any>(
  entries: Iterable<readonly [PropertyKey, T]>
): { [k in PropertyKey]: T }
export function fromEntries(entries: Iterable<readonly any[]>): any
export function fromEntries(entries: Iterable<readonly any[]>): any {
  return [...entries].reduce(
    (object, [key, value]) => ({
      ...object,
      [key]: value
    }),
    {}
  )
}
