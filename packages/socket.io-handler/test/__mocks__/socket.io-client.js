let connectableState = 'success'

const mockEmit = jest.fn()
const mockClose = jest.fn()

const disconnectListeners = new Set()
const mockDisconnect = jest.fn(() =>
  disconnectListeners.forEach(listener => listener())
)

const mockOn = jest.fn((event, callback) => {
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
      }
      break
    }

    case 'connect_timeout': {
      if (connectableState === 'timeout') {
        setImmediate(() => {
          callback(new Error('Mock connection timeout'))
        })
      }
      break
    }
  }
})

const mockIo = jest.fn(() => ({
  on: mockOn,
  close: mockClose,
  emit: mockEmit
}))

module.exports = mockIo
module.exports.__reset = () => {
  mockIo.mockClear()
  mockOn.mockClear()
  mockClose.mockClear()
  mockEmit.mockClear()
  mockDisconnect.mockClear()
  disconnectListeners.clear()
  connectableState = 'success'
}
module.exports.__mock__ = {
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
