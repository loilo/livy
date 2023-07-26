import { isFormattableHandlerInterface } from '../../src/handlers/is-formattable-handler-interface'

describe('@livy/util/lib/handlers/is-formattable-handler-interface', () => {
  it('should recognize formattable handlers', () => {
    expect(isFormattableHandlerInterface({ formatter: {} })).toBe(true)
    expect(
      isFormattableHandlerInterface({
        get formatter() {},
        set formatter(value) {}
      })
    ).toBe(true)
  })

  it('should reject primitives', () => {
    expect(isFormattableHandlerInterface(1)).toBe(false)
    expect(isFormattableHandlerInterface(NaN)).toBe(false)
    expect(isFormattableHandlerInterface(true)).toBe(false)
    expect(isFormattableHandlerInterface('foo')).toBe(false)
  })

  it('should reject null', () => {
    expect(isFormattableHandlerInterface(null)).toBe(false)
  })

  it('should missing property, getter or setter', () => {
    expect(isFormattableHandlerInterface({})).toBe(false)
    expect(isFormattableHandlerInterface({ get formatter() {} })).toBe(false)
    expect(isFormattableHandlerInterface({ set formatter(value) {} })).toBe(
      false
    )
  })
})
