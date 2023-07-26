import helpers from '../src/helpers'

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
    expect(helpers.isEmpty(undefined)).toBeTrue()
    expect(helpers.isEmpty(null)).toBeTrue()
    expect(helpers.isEmpty('')).toBeTrue()
    expect(helpers.isEmpty([])).toBeTrue()
    expect(helpers.isEmpty({})).toBeTrue()

    expect(helpers.isEmpty({ foo: null })).toBeFalse()
    expect(helpers.isEmpty([null])).toBeFalse()
    expect(helpers.isEmpty('   ')).toBeFalse()
    expect(helpers.isEmpty(new (class {})())).toBeFalse()
    expect(helpers.isEmpty(0)).toBeFalse()
    expect(helpers.isEmpty(false)).toBeFalse()
  })

  test('capitalizeFirstLetter', () => {
    expect(helpers.capitalizeFirstLetter('')).toBe('')
    expect(helpers.capitalizeFirstLetter('Foo')).toBe('Foo')
    expect(helpers.capitalizeFirstLetter('bar')).toBe('Bar')
    expect(helpers.capitalizeFirstLetter('_baz')).toBe('_baz')
  })

  test('isPrimitive', () => {
    expect(helpers.isPrimitive(null)).toBeTrue()
    expect(helpers.isPrimitive(undefined)).toBeTrue()
    expect(helpers.isPrimitive('foo')).toBeTrue()
    expect(helpers.isPrimitive(5)).toBeTrue()
    expect(helpers.isPrimitive(true)).toBeTrue()
    expect(helpers.isPrimitive(Symbol('bar'))).toBeTrue()

    if (typeof BigInt === 'function') {
      expect(helpers.isPrimitive(BigInt('5'))).toBeTrue()
    }

    expect(helpers.isPrimitive(function () {})).toBeFalse()
    expect(helpers.isPrimitive({})).toBeFalse()
    expect(helpers.isPrimitive([])).toBeFalse()
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
    ).toBeTrue()

    const array = []
    array.then = () => {}
    expect(helpers.isPromiseLike(array)).toBeTrue()

    function f() {}
    f.then = () => {}
    expect(helpers.isPromiseLike(f)).toBeTrue()

    expect(helpers.isPromiseLike({})).toBeFalse()
    expect(helpers.isPromiseLike(() => {})).toBeFalse()
  })

  test('isPromise', () => {
    expect(
      helpers.isPromise({
        then() {},
        catch() {}
      })
    ).toBeTrue()

    const array = []
    array.then = () => {}
    array.catch = () => {}
    expect(helpers.isPromise(array)).toBeTrue()

    function f() {}
    f.then = () => {}
    f.catch = () => {}
    expect(helpers.isPromise(f)).toBeTrue()

    expect(helpers.isPromise({ then() {} })).toBeFalse()
    expect(helpers.isPromise({ catch() {} })).toBeFalse()
    expect(helpers.isPromise(() => {})).toBeFalse()
  })

  test('fromEntries', () => {
    expect(helpers.fromEntries([])).toEqual({})
    expect(
      helpers.fromEntries([
        ['a', 1],
        ['b', 2]
      ])
    ).toEqual({ a: 1, b: 2 })
    expect(
      helpers.fromEntries([
        ['a', 1],
        ['b', 2],
        ['a', 3]
      ])
    ).toEqual({ a: 3, b: 2 })
  })
})
