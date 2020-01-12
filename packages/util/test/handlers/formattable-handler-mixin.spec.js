const {
  FormattableHandlerMixin
} = require('../../src/handlers/formattable-handler-mixin')

class Handler extends FormattableHandlerMixin(class {}) {}

describe('@livy/util/lib/handlers/formattable-handler-mixin', () => {
  it('should use the default formatter when no explicit one is defined', () => {
    const handler = new Handler()

    expect(handler.formatter).toEqual(handler.defaultFormatter)
  })

  it('should create a new default formatter instance on each request', () => {
    const handler = new Handler()

    expect(handler.defaultFormatter).toEqual(handler.defaultFormatter)
    expect(handler.defaultFormatter).not.toBe(handler.defaultFormatter)
  })

  it('should codify the default formatter as explicit once requested', () => {
    const handler = new Handler()

    // Once requested, handler.formatter always returns
    // the same instance of the default formatter
    const formatter = handler.formatter
    expect(handler.formatter).toBe(formatter)
  })

  it('should use be able to override the default formatter by inheritance', () => {
    const defaultFormatter = {}

    class CustomDefaultHandler extends Handler {
      get defaultFormatter() {
        return defaultFormatter
      }
    }

    const handler = new CustomDefaultHandler()

    expect(handler.formatter).toEqual(defaultFormatter)
  })

  it('should fail to set the default formatter', () => {
    const handler = new Handler()

    const defaultFormatter = handler.defaultFormatter
    handler.defaultFormatter = {}

    expect(handler.defaultFormatter).toEqual(defaultFormatter)
    expect(handler.formatter).toEqual(defaultFormatter)
  })

  it('should be able to set formatter', () => {
    const handler = new Handler()
    const formatter = {}

    handler.formatter = formatter
    expect(handler.formatter).toBe(formatter)
  })
})
