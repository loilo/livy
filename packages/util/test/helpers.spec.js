import { afterEach, describe, expect, test } from 'vitest'
import * as helpers from '../src/helpers'

const { date } = livyTestGlobals

describe('@livy/util/lib/helpers', () => {
  afterEach(() => {
    date.release()
  })

  test('sanitizeRegex', () => {
    expect(helpers.sanitizeRegex('_-[]/{}()*+?.\\^$|')).toBe(
      '_\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|'
    )
  })

  test('replaceTokens', () => {
    expect(
      helpers.replaceTokens('-a-%a%-%a/b%-', {
        a: 'foo',
        'a/b': 'bar'
      })
    ).toBe('-a-foo-bar-')
  })

  test('stripTags', () => {
    expect(helpers.stripTags(`Hello <strong class="foo">world</strong>!`)).toBe(
      'Hello world!'
    )
  })

  test('escapeHtmlEntities', () => {
    expect(helpers.escapeHtmlEntities('?<>"&')).toBe('?&lt;&gt;&quot;&amp;')
  })

  test('omit', () => {
    expect(helpers.omit({ a: 1, b: 2, c: 3, d: 4 }, 'a', 'c')).toEqual({
      b: 2,
      d: 4
    })
  })

  test('isEmpty', () => {
    expect(helpers.isEmpty(undefined)).toBe(true)
    expect(helpers.isEmpty(null)).toBe(true)
    expect(helpers.isEmpty('')).toBe(true)
    expect(helpers.isEmpty([])).toBe(true)
    expect(helpers.isEmpty({})).toBe(true)

    expect(helpers.isEmpty({ foo: null })).toBe(false)
    expect(helpers.isEmpty([null])).toBe(false)
    expect(helpers.isEmpty('   ')).toBe(false)
    expect(helpers.isEmpty(new (class {})())).toBe(false)
    expect(helpers.isEmpty(0)).toBe(false)
    expect(helpers.isEmpty(false)).toBe(false)
  })

  test('capitalizeFirstLetter', () => {
    expect(helpers.capitalizeFirstLetter('')).toBe('')
    expect(helpers.capitalizeFirstLetter('Foo')).toBe('Foo')
    expect(helpers.capitalizeFirstLetter('bar')).toBe('Bar')
    expect(helpers.capitalizeFirstLetter('_baz')).toBe('_baz')
  })

  test('isPrimitive', () => {
    expect(helpers.isPrimitive(null)).toBe(true)
    expect(helpers.isPrimitive(undefined)).toBe(true)
    expect(helpers.isPrimitive('foo')).toBe(true)
    expect(helpers.isPrimitive(5)).toBe(true)
    expect(helpers.isPrimitive(true)).toBe(true)
    expect(helpers.isPrimitive(Symbol('bar'))).toBe(true)

    if (typeof BigInt === 'function') {
      expect(helpers.isPrimitive(BigInt('5'))).toBe(true)
    }

    expect(helpers.isPrimitive(function () {})).toBe(false)
    expect(helpers.isPrimitive({})).toBe(false)
    expect(helpers.isPrimitive([])).toBe(false)
  })

  test('getObviousTypeName', () => {
    expect(helpers.getObviousTypeName(undefined)).toBe('undefined')
    expect(helpers.getObviousTypeName(null)).toBe('null')
    expect(helpers.getObviousTypeName('')).toBe('string')
    expect(helpers.getObviousTypeName([])).toBe('array')
    expect(helpers.getObviousTypeName({})).toBe('object')
    expect(helpers.getObviousTypeName(new (class {})())).toBe('object')
    expect(helpers.getObviousTypeName(0)).toBe('number')
    expect(helpers.getObviousTypeName(false)).toBe('boolean')
    expect(helpers.getObviousTypeName(() => {})).toBe('function')
  })

  test('isPromiseLike', () => {
    expect(
      helpers.isPromiseLike({
        then() {}
      })
    ).toBe(true)

    const array = []
    array.then = () => {}
    expect(helpers.isPromiseLike(array)).toBe(true)

    function f() {}
    f.then = () => {}
    expect(helpers.isPromiseLike(f)).toBe(true)

    expect(helpers.isPromiseLike({})).toBe(false)
    expect(helpers.isPromiseLike(() => {})).toBe(false)
  })

  test('isPromise', () => {
    expect(
      helpers.isPromise({
        then() {},
        catch() {}
      })
    ).toBe(true)

    const array = []
    array.then = () => {}
    array.catch = () => {}
    expect(helpers.isPromise(array)).toBe(true)

    function f() {}
    f.then = () => {}
    f.catch = () => {}
    expect(helpers.isPromise(f)).toBe(true)

    expect(helpers.isPromise({ then() {} })).toBe(false)
    expect(helpers.isPromise({ catch() {} })).toBe(false)
    expect(helpers.isPromise(() => {})).toBe(false)
  })
})
