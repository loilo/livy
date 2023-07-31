import { vi } from 'vitest'

import EventEmitter from 'node:events'

const ee = new EventEmitter()

const mockSocketOn = vi.fn((event, callback) => ee.on(event, callback))
const mockSocketOnce = vi.fn((event, callback) => ee.once(event, callback))
const mockSocketOff = vi.fn((event, callback) =>
  ee.removeListener(event, callback)
)
const mockSocketSetTimeout = vi.fn()
const mockSocketWrite = vi.fn((_, callback) => {
  setImmediate(() => {
    if (mock.canWrite === true) {
      callback()
    } else if (mock.canWrite === false) {
      callback(new Error('Mock: cannot write to socket'))
    } else {
      setTimeout(callback, mock.canWrite)
    }
  })
})

const mockSocket = {
  on: mockSocketOn,
  once: mockSocketOnce,
  removeListener: mockSocketOff,
  setTimeout: mockSocketSetTimeout,
  write: mockSocketWrite
}

const mockConnect = vi.fn((_, callback) => {
  setImmediate(() => {
    if (mock.canConnect === true) {
      callback()
    } else if (mock.canConnect === false) {
      ee.emit('error', new Error('Mock: cannot connect to socket'))
    } else {
      setTimeout(callback, mock.canConnect)
    }
  })

  return mockSocket
})

const mock = {
  connect: mockConnect,
  socket: mockSocket,
  socketOn: mockSocketOn,
  socketOnce: mockSocketOnce,
  socketOff: mockSocketOff,
  socketSetTimeout: mockSocketSetTimeout,
  socketWrite: mockSocketWrite,
  canConnect: true,
  canWrite: true
}

export default () => ({
  __mock__: mock,
  __reset: () => {
    mockConnect.mockClear()
    mockSocketOn.mockClear()
    mockSocketOnce.mockClear()
    mockSocketOff.mockClear()
    mockSocketSetTimeout.mockClear()
    mockSocketWrite.mockClear()
    mock.canConnect = true
    mock.canWrite = true
    ee.removeAllListeners()
  }
})
