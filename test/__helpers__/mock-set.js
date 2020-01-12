module.exports = function MockSet() {
  this.size = 0
  this.add = jest.fn(() => this)
  this.clear = jest.fn()
  this.delete = jest.fn(() => false)
  this.entries = jest.fn(function*() {})
  this.forEach = jest.fn()
  this.has = jest.fn(() => false)
  this.keys = jest.fn(function*() {})
  this.values = jest.fn(function*() {})
  this[Symbol.iterator] = function*() {}
}
