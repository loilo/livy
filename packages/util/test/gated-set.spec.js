const { GatedSet } = require('../src/gated-set')

describe('@livy/util/lib/gated-set', () => {
  it('should reject invalid test arguments', () => {
    expect(() => new GatedSet()).toThrowError(
      new Error('The validator must be a function, undefined given')
    )
    expect(() => new GatedSet(null)).toThrowError(
      new Error('The validator must be a function, null given')
    )
    expect(() => new GatedSet(0)).toThrowError(
      new Error('The validator must be a function, number given')
    )
    expect(() => new GatedSet('foo')).toThrowError(
      new Error('The validator must be a function, string given')
    )
    expect(() => new GatedSet([])).toThrowError(
      new Error('The validator must be a function, array given')
    )
    expect(() => new GatedSet({})).toThrowError(
      new Error('The validator must be a function, object given')
    )
    expect(() => new GatedSet(new (class {})())).toThrowError(
      new Error('The validator must be a function, object given')
    )
  })

  it('should work with no initial items', () => {
    const test = jest.fn()
    new GatedSet(test)

    expect(test).not.toHaveBeenCalled()
  })

  it('should validate initial valid items', () => {
    const test = jest.fn()
    new GatedSet(test, ['a', 'b', 'c'])

    expect(test).toHaveBeenCalledTimes(3)
    expect(test).toHaveBeenNthCalledWith(1, 'a')
    expect(test).toHaveBeenNthCalledWith(2, 'b')
    expect(test).toHaveBeenNthCalledWith(3, 'c')
  })

  it('should validate item on add', () => {
    const test = jest.fn()
    const set = new GatedSet(test)
    set
      .add('a')
      .add('b')
      .add('c')

    expect(test).toHaveBeenCalledTimes(3)
    expect(test).toHaveBeenNthCalledWith(1, 'a')
    expect(test).toHaveBeenNthCalledWith(2, 'b')
    expect(test).toHaveBeenNthCalledWith(3, 'c')
  })
})
