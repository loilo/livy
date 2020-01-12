module.exports = function MockFormatter() {
  this.format = jest.fn(() => '')
  this.formatBatch = jest.fn(() => '')
}
