import { vi } from 'vitest'

export function createMockProcessor({ functional, resettable = false } = {}) {
  if (typeof functional === 'undefined') {
    functional = !resettable
  }

  if (functional) {
    return vi.fn()
  } else {
    const processor = {
      process: vi.fn()
    }

    if (resettable) {
      processor.reset = vi.fn()
    }

    return processor
  }
}
