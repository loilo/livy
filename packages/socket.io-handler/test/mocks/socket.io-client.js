import { vi } from 'vitest'

export default () => {
  let connectableState = 'success'

  const mockEmit = vi.fn()
  const mockClose = vi.fn()

  const disconnectListeners = new Set()
  const mockDisconnect = vi.fn(() =>
    disconnectListeners.forEach(listener => listener())
  )

  const mockOn = vi.fn((event, callback) => {
    switch (event) {
      case 'connect': {
        if (connectableState === 'success') {
          setImmediate(() => {
            callback(mockIo)
          })
        }
        break
      }

      case 'disconnect': {
        disconnectListeners.add(callback)
        break
      }

      case 'connect_error': {
        if (connectableState === 'error') {
          setImmediate(() => {
            callback(new Error('Mock connection error'))
          })
        } else if (connectableState === 'timeout') {
          setImmediate(() => {
            callback(new Error('Mock connection timeout'))
          })
        }
        break
      }
    }
  })

  const mockIo = vi.fn(() => ({
    on: mockOn,
    close: mockClose,
    emit: mockEmit
  }))

  mockIo.__reset = () => {
    mockIo.mockClear()
    mockOn.mockClear()
    mockClose.mockClear()
    mockEmit.mockClear()
    mockDisconnect.mockClear()
    disconnectListeners.clear()
    connectableState = 'success'
  }

  mockIo.__mock__ = {
    on: mockOn,
    close: mockClose,
    emit: mockEmit,
    get connectableState() {
      return connectableState
    },
    set connectableState(state) {
      connectableState = state
    },
    disconnect: mockDisconnect
  }

  return { io: mockIo }
}
