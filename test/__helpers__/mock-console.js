module.exports = function MockConsole() {
  this.debug = jest.fn()
  this.info = jest.fn()
  this.log = jest.fn()
  this.warn = jest.fn()
  this.error = jest.fn()

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
