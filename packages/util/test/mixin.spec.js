import { describe, expect, it } from 'vitest'
import { Mixin } from '../src/mixin'

describe('@livy/util/lib/mixin', () => {
  it('should correctly mix in classes', () => {
    const mixin = Mixin(
      Base =>
        class extends Base {
          mixin() {}
        }
    )

    class Parent {
      parent() {}
    }

    class Child extends mixin(Parent) {
      child() {}
    }

    const child = new Child()

    expect(child).toBeInstanceOf(Child)
    expect(child).toBeInstanceOf(Parent)

    expect(typeof child.parent).toBe('function')
    expect(typeof child.child).toBe('function')
    expect(typeof child.mixin).toBe('function')
  })
})
