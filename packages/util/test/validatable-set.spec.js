const { ValidatableSet } = require('../src/validatable-set')

describe('@livy/util/lib/validatable-set', () => {
  it('should perform tests with "some"', () => {
    const set = new ValidatableSet()

    // Empty sets never return true
    expect(set.some(() => true)).toBeFalse()

    set
      .add(1)
      .add(2)
      .add(3)
    expect(set.some(value => value % 2 === 0)).toBeTrue()
    expect(set.some(value => value > 3)).toBeFalse()
  })

  it('should perform tests with "every"', () => {
    const set = new ValidatableSet()

    // Empty sets always return true
    expect(set.every(() => false)).toBeTrue()

    set
      .add(1)
      .add(2)
      .add(3)
    expect(set.every(value => value % 2 === 0)).toBeFalse()
    expect(set.every(value => value <= 3)).toBeTrue()
  })
})
