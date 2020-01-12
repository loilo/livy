const { ProcessIdProcessor } = require('../src/process-id-processor')

describe('@livy/process-id-processor', () => {
  afterEach(() => {
    date.release()
  })

  it('should add process ID to records', () => {
    expect(ProcessIdProcessor(record('info'))).toEqual(
      record('info', '', {
        extra: { pid: process.pid }
      })
    )
  })
})
