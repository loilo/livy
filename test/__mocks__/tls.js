// The "tls" module mock is not as sophisticated as the "net" mock
// It basically only checks whether it has been connected to

const mockConnect = jest.fn((_, callback) => {
  setImmediate(() => callback())

  return {
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    setTimeout: jest.fn(),
    write: jest.fn((_, callback) => setImmediate(() => callback()))
  }
})

module.exports = {
  connect: mockConnect
}

module.exports.__esModule = true
module.exports.__reset = () => {
  mockConnect.mockClear()
}
