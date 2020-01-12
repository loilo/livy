const mockSendMail = jest.fn((mailOptions, callback) => {
  setImmediate(callback)
})
const mockCreateTransport = jest.fn((logger, sendmailOptions) => ({
  sendMail: mockSendMail
}))

module.exports = {
  createTransport: mockCreateTransport
}
module.exports.__mock__ = {
  createTransport: mockCreateTransport,
  sendMail: mockSendMail
}
module.exports.__reset = () => {
  mockCreateTransport.mockClear()
  mockSendMail.mockClear()
}
