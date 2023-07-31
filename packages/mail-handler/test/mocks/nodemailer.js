import { vi } from 'vitest'

export default () => {
  const mockSendMail = vi.fn((mailOptions, callback) => {
    setImmediate(callback)
  })

  const mockCreateTransport = vi.fn((logger, sendmailOptions) => ({
    sendMail: mockSendMail
  }))

  return {
    createTransport: mockCreateTransport,
    sendMail: mockSendMail,
    __reset() {
      mockCreateTransport.mockClear()
      mockSendMail.mockClear()
    }
  }
}
