import { getObviousTypeName } from './helpers'
import { ValidatableSet } from './validatable-set'

type GatedSetValidator<T> = (item: unknown) => asserts item is T

export class GatedSet<T> extends ValidatableSet<T> {
  private validator: GatedSetValidator<T>

  public constructor(validator: GatedSetValidator<T>, iterable?: Iterable<T>) {
    if (typeof validator !== 'function') {
      throw new TypeError(
        `The validator must be a function, ${getObviousTypeName(
          validator
        )} given`
      )
    }

    super()

    this.validator = validator

    if (iterable) {
      for (const value of iterable) {
        this.add(value)
      }
    }
  }

  /**
   * @inheritdoc
   */
  public add(value: T) {
    this.validator(value)
    super.add(value)
    return this
  }
}
