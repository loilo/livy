import { describe, expect, it, vi } from 'vitest'
import { ProcessableHandlerMixin } from '../../src/handlers/processable-handler-mixin'

const { record } = livyTestGlobals

class Handler extends ProcessableHandlerMixin(class {}) {}

describe('@livy/util/lib/handlers/processable-handler-mixin', () => {
  it('should expose a "processors" Set', async () => {
    expect(new Handler().processors).toBeInstanceOf(Set)
  })

  it('should make the "processors" read-only', () => {
    const handler = new Handler()
    const processors = handler.processors

    expect(handler.processors).toBe(processors)

    expect(() => (handler.processors = new Set())).toThrow()
  })

  it('should iterate over all processors in order when calling "processRecord"', () => {
    const handler = new Handler()

    // Stateless processor
    const processor1 = vi.fn(() => record('info'))

    // Stateful processor
    const processor2 = { process: vi.fn() }

    handler.processors.add(processor1)
    handler.processors.add(processor2)

    handler.processRecord(record('debug'))

    expect(processor1).toHaveBeenCalledTimes(1)
    expect(processor1).toHaveBeenLastCalledWith(record('debug'))
    expect(processor2.process).toHaveBeenCalledTimes(1)
    expect(processor2.process).toHaveBeenLastCalledWith(record('info'))
  })

  it('should pass on "reset" calls to all processors', () => {
    const handler = new Handler()
    const processor1 = {
      process() {},
      reset: vi.fn()
    }
    const processor2 = {
      process() {},
      reset: vi.fn()
    }

    handler.processors.add(processor1)
    handler.processors.add(processor2)

    handler.reset()

    expect(processor1.reset).toHaveBeenCalledTimes(1)
    expect(processor2.reset).toHaveBeenCalledTimes(1)
  })
})
