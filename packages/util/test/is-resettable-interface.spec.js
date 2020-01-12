const { isResettableInterface } = require('../src/is-resettable-interface')

describe('@livy/util/lib/is-resettable-interface', () => {
  it('should recognize resettable objects', () => {
    expect(isResettableInterface({ reset() {} })).toBe(true)
  })

  it('should reject primitives', () => {
    expect(isResettableInterface(1)).toBe(false)
    expect(isResettableInterface(NaN)).toBe(false)
    expect(isResettableInterface(true)).toBe(false)
    expect(isResettableInterface('foo')).toBe(false)
  })

  it('should reject null', () => {
    expect(isResettableInterface(null)).toBe(false)
  })

  it('should reject missing or non-function "reset" properties', () => {
    expect(isResettableInterface({})).toBe(false)
    expect(isResettableInterface({ reset: {} })).toBe(false)
    expect(isResettableInterface({ reset: null })).toBe(false)
  })
})
