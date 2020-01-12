const { Mixin } = require('../src/mixin')

describe('@livy/util/lib/mixin', () => {
  it('should correctly mix in classes', () => {
    const mixin = Mixin(Base => class extends Base {
      mixin() {}
    })

    class Parent {
      parent() {}
    }

    class Child extends mixin(Parent) {
      child() {}
    }

    const child = new Child

    expect(child).toBeInstanceOf(Child)
    expect(child).toBeInstanceOf(Parent)

    expect(child.parent).toBeFunction()
    expect(child.child).toBeFunction()
    expect(child.mixin).toBeFunction()
  })
})
