import { vi } from 'vitest'

export default () => {
  const got = vi.fn(() => Promise.resolve())

  return {
    default: got,
    __resetGot: () => {
      got.mockClear()
    }
  }
}
