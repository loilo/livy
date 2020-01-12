jest.mock('os')
const { HostnameProcessor } = require('../src/hostname-processor')

describe('@livy/hostname-processor', () => {
  it('should add hostname to records', () => {
    expect(HostnameProcessor(record('info'))).toEqual(
      record('info', '', {
        extra: { hostname: 'mock-hostname' }
      })
    )
  })
})
