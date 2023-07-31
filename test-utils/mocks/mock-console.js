import { vi } from 'vitest'

export function MockConsole() {
  this.debug = vi.fn()
  this.info = vi.fn()
  this.log = vi.fn()
  this.warn = vi.fn()
  this.error = vi.fn()

  this.__hasBeenCalled = () => {
    return (
      this.debug.mock.calls.length > 0 ||
      this.info.mock.calls.length > 0 ||
      this.log.mock.calls.length > 0 ||
      this.warn.mock.calls.length > 0 ||
      this.error.mock.calls.length > 0
    )
  }
}
