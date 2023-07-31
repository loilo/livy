import { describe, expect, it } from 'vitest'
import { isProcessableHandlerInterface } from '../../src/handlers/is-processable-handler-interface'

describe('@livy/util/lib/handlers/is-processable-handler-interface', () => {
  it('should recognize processable handlers', () => {
    expect(isProcessableHandlerInterface({ processors: new Set() })).toBe(true)
  })

  it('should reject primitives', () => {
    expect(isProcessableHandlerInterface(1)).toBe(false)
    expect(isProcessableHandlerInterface(NaN)).toBe(false)
    expect(isProcessableHandlerInterface(true)).toBe(false)
    expect(isProcessableHandlerInterface('foo')).toBe(false)
  })

  it('should reject null', () => {
    expect(isProcessableHandlerInterface(null)).toBe(false)
  })

  it('should reject missing or non-Set "processors" properties', () => {
    expect(isProcessableHandlerInterface({})).toBe(false)
    expect(isProcessableHandlerInterface({ processors: {} })).toBe(false)
    expect(isProcessableHandlerInterface({ processors: null })).toBe(false)
    expect(isProcessableHandlerInterface({ processors() {} })).toBe(false)
  })
})
