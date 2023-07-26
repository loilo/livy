import { RespectLevelMixin } from '../../src/handlers/respect-level-mixin'

describe('@livy/util/lib/handlers/respect-level-mixin', () => {
  it('should inject a "level" property and an "isHandling" method', () => {
    class Handler extends RespectLevelMixin(class {}) {}

    const handler = new Handler()

    expect(handler.level).toBe('debug')
    expect(handler.isHandling('debug')).toBe(true)
    expect(handler.isHandling('notice')).toBe(true)
    expect(handler.isHandling('error')).toBe(true)
    expect(handler.isHandling('critical')).toBe(true)

    handler.level = 'error'
    expect(handler.level).toBe('error')
    expect(handler.isHandling('debug')).toBe(false)
    expect(handler.isHandling('notice')).toBe(false)
    expect(handler.isHandling('error')).toBe(true)
    expect(handler.isHandling('critical')).toBe(true)
  })
})
