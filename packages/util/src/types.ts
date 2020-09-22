/**
 * Matches an object with arbitrary keys and values of type T
 */
export interface AnyObject<T = any> {
  [key: string]: T
}

/**
 * Object with keys of T and strings as values
 */
export type Stringified<T> = { [P in keyof T]: string }

/**
 * Various utilities for working with classes
 */
export namespace Class {
  /**
   * A constructable (non-abstract) class
   * - T represents objects created by the class
   * - U represents the arguments passed to the class constructor
   */
  export type Constructable<T extends {} = {}, U extends any[] = any[]> = new (
    ...args: U
  ) => T

  /**
   * An abstract (non-constructable) class
   * - T represents objects created by the class
   */
  export type Abstract<T extends {} = {}> = Function & { prototype: T }

  /**
   * Any class, may be constructable or abstract
   * - T represents objects created by the class
   */
  export type Any<T extends {} = {}> = Abstract<T> | Constructable<T>

  /**
   * Get the arguments list of a class constructor as a tuple
   */
  export type ConstructorArgs<T> = T extends Constructable<any, infer U>
    ? U
    : never

  /**
   * Create a constructable class type from a constructable or abstract class type
   */
  export type LoosenConstructable<T extends Any> = T extends Constructable<
    infer V
  >
    ? Any<V>
    : T extends Abstract<infer V> ? Any<V> : never

  /**
   * Create a constructable class type from a constructable or abstract class type
   */
  export type MakeConstructable<T extends Any> = T extends Constructable
    ? T
    : T extends Abstract<infer V> ? Constructable<V> : never

  /**
   * Like InstanceType<T>, but works on abstract classes as well
   */
  export type InstanceType<T extends Any> = T extends Constructable<infer U>
    ? U
    : T extends Abstract<infer V> ? V : never
}

/*
 * The following typings are taken from the `type-fest` package to avoid having to add it as a dependency
 */

/**
 * Represents either the value or the value wrapped in `PromiseLike`.
 */
export type Promisable<T> = T | PromiseLike<T>

/**
 * Matches any primitive value
 */
export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

/**
 * An object without certain keys, stricter than `Omit`
 */
type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<
  ObjectType,
  Exclude<keyof ObjectType, KeysType>
>

/**
 * Requires at least one of the given keys
 */
export type RequireAtLeastOne<
  ObjectType,
  KeysType extends keyof ObjectType = keyof ObjectType
> = {
  [// For each Key in KeysType make a mapped type
  Key in KeysType]: // …by picking that Key's type and making it required
  Required<Pick<ObjectType, Key>>
}[KeysType] &
  // …then, make intersection types by adding the remaining keys to each mapped type.
  Except<ObjectType, KeysType>

/**
 * Makes the given keys required. The remaining keys are kept as is. The sister of the `SetOptional` type
 */
export type SetRequired<
  BaseType,
  Keys extends keyof BaseType = keyof BaseType
> =
  // Pick just the keys that are not required from the base type.
  Pick<BaseType, Exclude<keyof BaseType, Keys>> &
    // Pick the keys that should be required from the base type and make them required.
    Required<Pick<BaseType, Keys>> extends infer InferredType // If `InferredType` extends the previous, then for each key, use the inferred type key.
    ? { [KeyType in keyof InferredType]: InferredType[KeyType] }
    : never
