const {
  isClosableHandlerInterface
} = require('../../src/handlers/is-closable-handler-interface')

describe('@livy/util/lib/handlers/is-closable-handler-interface', () => {
  it('should recognize closable handlers', () => {
    expect(isClosableHandlerInterface({ close() {} })).toBe(true)
  })

  it('should reject primitives', () => {
    expect(isClosableHandlerInterface(1)).toBe(false)
    expect(isClosableHandlerInterface(NaN)).toBe(false)
    expect(isClosableHandlerInterface(true)).toBe(false)
    expect(isClosableHandlerInterface('foo')).toBe(false)
  })

  it('should reject null', () => {
    expect(isClosableHandlerInterface(null)).toBe(false)
  })

  it('should reject missing or non-function "close" properties', () => {
    expect(isClosableHandlerInterface({})).toBe(false)
    expect(isClosableHandlerInterface({ close: {} })).toBe(false)
    expect(isClosableHandlerInterface({ close: null })).toBe(false)
  })
})
