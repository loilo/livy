const got = jest.fn(() => Promise.resolve())

module.exports = got
module.exports.__reset = () => {
  got.mockClear()
}
