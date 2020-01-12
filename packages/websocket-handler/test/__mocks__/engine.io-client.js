let connectable = true

const mockSend = jest.fn()

const closeListeners = new Set()
const mockClose = jest.fn(() => closeListeners.forEach(listener => listener()))

const mockOn = jest.fn((event, callback) => {
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

const mockEio = jest.fn(() => ({
  on: mockOn,
  close: mockClose,
  send: mockSend
}))

module.exports = mockEio
module.exports.__reset = () => {
  mockEio.mockClear()
  mockOn.mockClear()
  mockClose.mockClear()
  closeListeners.clear()
  mockSend.mockClear()
  connectable = true
}
module.exports.__mock__ = {
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
