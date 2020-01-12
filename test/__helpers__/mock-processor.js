module.exports = function createMockProcessor({
  functional,
  resettable = false
} = {}) {
  if (typeof functional === 'undefined') {
    functional = !resettable
  }

  if (functional) {
    return jest.fn()
  } else {
    const processor = {
      process: jest.fn()
    }

    if (resettable) {
      processor.reset = jest.fn()
    }

    return processor
  }
}
