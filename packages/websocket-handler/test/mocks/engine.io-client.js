import { vi } from 'vitest'

export default () => {
  let connectable = true

  const mockSend = vi.fn()

  const closeListeners = new Set()
  const mockClose = vi.fn(() => closeListeners.forEach(listener => listener()))

  const mockOn = vi.fn((event, callback) => {
    switch (event) {
      case 'open': {
        if (connectable) {
          setImmediate(() => {
            callback(mockEio)
          })
        }
        break
      }

      case 'close': {
        closeListeners.add(callback)
        break
      }

      case 'error': {
        if (!connectable) {
          setImmediate(() => {
            callback(new Error('Mock connection error'))
          })
        }
        break
      }
    }
  })

  const mockEio = vi.fn(() => ({
    on: mockOn,
    close: mockClose,
    send: mockSend
  }))

  return {
    Socket: mockEio,
    __reset: () => {
      mockEio.mockClear()
      mockOn.mockClear()
      mockClose.mockClear()
      closeListeners.clear()
      mockSend.mockClear()
      connectable = true
    },
    __mock__: {
      on: mockOn,
      close: mockClose,
      send: mockSend,
      get connectable() {
        return connectable
      },
      set connectable(state) {
        connectable = state
      }
    }
  }
}
