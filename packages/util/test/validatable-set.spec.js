import { describe, expect, it } from 'vitest'
import { ValidatableSet } from '../src/validatable-set'

describe('@livy/util/lib/validatable-set', () => {
  it('should perform tests with "some"', () => {
    const set = new ValidatableSet()

    // Empty sets never return true
    expect(set.some(() => true)).toBe(false)

    set.add(1).add(2).add(3)
    expect(set.some(value => value % 2 === 0)).toBe(true)
    expect(set.some(value => value > 3)).toBe(false)
  })

  it('should perform tests with "every"', () => {
    const set = new ValidatableSet()

    // Empty sets always return true
    expect(set.every(() => false)).toBe(true)

    set.add(1).add(2).add(3)
    expect(set.every(value => value % 2 === 0)).toBe(false)
    expect(set.every(value => value <= 3)).toBe(true)
  })
})
