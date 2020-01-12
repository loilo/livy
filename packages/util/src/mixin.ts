import { Class } from './types'

/**
 * From an object type T create the type that does not have any conflicts with T
 */
type NoConflict<T> = { [key: string]: any } & Partial<T>

/**
 * Like NoConflict<T>, but for class types
 */
type NoConflictClass<T extends Class.Any> = Class.Any<
  NoConflict<Class.InstanceType<T>>
>

/**
 * Below is my personal approach to TypeScript mixins.
 * It's a slightly altered approach derived from regular mixin classes.
 * @see https://mariusschulz.com/blog/mixin-classes-in-typescript
 *
 * Advantages:
 * - Built-in support for extending abstract classes (possible with mixin classes but requires annoying amounts of additional boilerplate)
 * - Type-hinting for super() calls in classes which extend mixins
 *
 * Disadvantages:
 * - Additional boilerplate through the "Mixin" wrapper
 *   This is however compensated by omitting other boilerplate (manual type-hinting).
 */
export namespace Mixin {
  /**
   * A Function that takes a class T and returns a class U that extends T
   */
  export interface Extender<
    T extends Class.Any,
    U extends Class.MakeConstructable<T>,
    V extends any[]
  > {
    (Base: T, ...additionalArgs: V): U
  }

  /**
   * A generic function with a class type T that takes a class type U
   * (which must not be conflicting with T) and returns the intersection of T and U
   */
  export interface Wrapper<T extends Class.Constructable, V extends any[]> {
    <U extends NoConflictClass<T>>(Base: U, ...additionalArgs: V): U & T
  }
}

/* eslint-disable no-redeclare */
// Disable no-redeclare because typescript-eslint/typescript-eslint#60

/**
 * @param extender A callback which receives a base class T and returns a class U that extends T.
 *                 May take an arbitrary number of additional arguments for more fine-grained control.
 * @return A function which can be passed a base class and returns a new class extending it
 *
 * @example Basic example
 * const WriteAccess = Mixin(_ => class extends _ {
 *   write(file: string, content: string) {
 *     // Do some write action
 *   }
 * })
 *
 * class User {
 *   constructor(protected name: string) {}
 * }
 *
 * class PrivilegedUser extends WriteAccess(User) {
 *   constructor(name: string, protected role: 'editor' | 'admin') {
 *     super(name) // <- type-hinted!
 *   }
 *
 *   method() {
 *     this.write('/some/file/path', 'some content') // <- type-hinted!
 *   }
 * }
 */
export function Mixin<
  T extends Class.Constructable,
  U extends Class.MakeConstructable<T>,
  V extends any[]
>(extender: Mixin.Extender<T, U, V>): Mixin.Wrapper<U, V> {
  return <X extends NoConflictClass<U>>(
    Origin: X = class {} as X,
    ...additionalArguments: V
  ) => extender(Origin as any, ...additionalArguments) as X & U
}
/* eslint-enable no-redeclare */
