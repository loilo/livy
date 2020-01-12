let memoryUsage
const mockMemoryUsage = jest
  .spyOn(process, 'memoryUsage')
  .mockImplementation(() => ({
    heapTotal: memoryUsage
  }))

jest.mock('os')
const { MemoryUsageProcessor } = require('../src/memory-usage-processor')

describe('@livy/memory-usage-processor', () => {
  beforeEach(() => {
    memoryUsage = 200
  })

  afterAll(() => {
    mockMemoryUsage.mockRestore()
  })

  it('should add human-readable memory usage to records', () => {
    const defaultProcessor = new MemoryUsageProcessor()

    expect(defaultProcessor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '200 Bytes' } })
    )

    const explicitProcessor = new MemoryUsageProcessor(true)

    expect(explicitProcessor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '200 Bytes' } })
    )
  })

  it('should use proper breakpoints and rounding for human-readable units', () => {
    const processor = new MemoryUsageProcessor()

    // 0 = 0 Bytes
    memoryUsage = 0
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '0 Bytes' } })
    )

    // Breakpoint is 1024, so 1023 should still be bytes
    memoryUsage = 1023
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '1023 Bytes' } })
    )

    // 1024 Bytes = 1 KB
    memoryUsage = 1024
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '1 KB' } })
    )

    // 1200 Bytes = 1.172 KB, round to one decimal
    memoryUsage = 1200
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '1.2 KB' } })
    )

    // 200.5 KB, round numbers > 100 to no decimals
    memoryUsage = 1024 * 200.5
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '201 KB' } })
    )

    // 1023.999 KB, round to 1 MB
    memoryUsage = 1024 ** 2 - 1
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '1 MB' } })
    )

    // 1024^2 KB = 1 MB
    memoryUsage = 1024 ** 2
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '1 MB' } })
    )

    // 1024^4 Bytes = 1 TB
    memoryUsage = 1024 ** 4
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '1 TB' } })
    )

    // 1024^5 Bytes = 1024 TB, TB is the maximum unit
    memoryUsage = 1024 ** 5
    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: '1024 TB' } })
    )
  })

  it('should fail to generate human-readable memory usage for unexpected numbers', () => {
    const processor = new MemoryUsageProcessor()

    memoryUsage = -1

    expect(() => {
      processor.process(record('info'))
    }).toThrowError(
      new Error(
        'Unexpected argument: Finite, non-negative number expected, received -1'
      )
    )
  })

  it('should add raw memory usage to records', () => {
    const processor = new MemoryUsageProcessor(false)

    expect(processor.process(record('info'))).toEqual(
      record('info', '', { extra: { memory_usage: 200 } })
    )
  })
})
