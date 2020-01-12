/**
 * A Set implementation that is validatable by .some() and .every()
 */
export class ValidatableSet<T> extends Set<T> {
  /**
   * Determines whether at least one member of the ArraySet satisfies a specified test
   *
   * @param test The callback to test each value against
   */
  public some(test: (value: T) => boolean) {
    for (const value of this) {
      if (test(value)) {
        return true
      }
    }

    return false
  }

  /**
   * Determines whether all the members of the ArraySet satisfy a specified test
   *
   * @param test The callback to test each value against
   */
  public every(test: (value: T) => boolean) {
    for (const value of this) {
      if (!test(value)) {
        return false
      }
    }

    return true
  }
}
