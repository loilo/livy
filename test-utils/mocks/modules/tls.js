// The "tls" module mock is not as sophisticated as the "net" mock
// It basically only checks whether it has been connected to
import { vi } from 'vitest'

export default () => {
  const mockConnect = vi.fn((_, callback) => {
    setImmediate(() => callback())

    return {
      on: vi.fn(),
      once: vi.fn(),
      removeListener: vi.fn(),
      setTimeout: vi.fn(),
      write: vi.fn((_, callback) => setImmediate(() => callback()))
    }
  })

  return {
    connect: mockConnect,
    __reset: () => {
      mockConnect.mockClear()
    }
  }
}
