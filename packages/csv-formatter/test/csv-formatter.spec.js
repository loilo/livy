import { describe, expect, it, vi } from 'vitest'
import { CsvFormatter } from '../src/csv-formatter'

const { record, TEST_CONSTANTS } = livyTestGlobals

describe('@livy/csv-formatter', () => {
  it('should genarete a correct default row', () => {
    const csvFormatter = new CsvFormatter()

    const logRecord = record('info', 'Test CsvFormatter', {
      context: { foo: 1 },
      extra: { bar: 2 }
    })

    expect(csvFormatter.format(logRecord)).toBe(
      `${TEST_CONSTANTS.DATE_ISO_MS},info,Test CsvFormatter,"{"""foo""":1}","{"""bar""":2}"`
    )
  })

  it('should batch format correctly', () => {
    const csvFormatter = new CsvFormatter()

    const record1 = record('info', 'Test CsvFormatter', {
      context: { foo: 1 },
      extra: { bar: 2 }
    })
    const record2 = record('notice', 'Test CsvFormatter')

    expect(csvFormatter.formatBatch([record1, record2])).toBe(
      `${TEST_CONSTANTS.DATE_ISO_MS},info,Test CsvFormatter,"{"""foo""":1}","{"""bar""":2}"\r\n${TEST_CONSTANTS.DATE_ISO_MS},notice,Test CsvFormatter,{},{}`
    )
  })

  it('should respect the "delimiter" option', () => {
    const csvFormatter = new CsvFormatter({
      delimiter: ' '
    })

    expect(csvFormatter.format(record('info', 'Test CsvFormatter'))).toBe(
      `${TEST_CONSTANTS.DATE_ISO_MS} info "Test CsvFormatter" {} {}`
    )
  })

  it('should respect the "enclosure" option', () => {
    const csvFormatter = new CsvFormatter({
      enclosure: '_'
    })

    expect(
      csvFormatter.format(
        record('info', 'Test_CsvFormatter', {
          context: { foo: 1 }
        })
      )
    ).toBe(
      `${TEST_CONSTANTS.DATE_ISO_MS},info,_Test___CsvFormatter_,{"foo":1},{}`
    )
  })

  it('should respect the "eol" option', () => {
    const csvFormatter = new CsvFormatter({
      eol: 'x'
    })

    const record1 = record('info', 'Test CsvFormatter')
    const record2 = record('notice', 'Test CsvFormatter')

    expect(csvFormatter.formatBatch([record1, record2])).toBe(
      `${TEST_CONSTANTS.DATE_ISO_MS},info,Test CsvFormatter,{},{}x${TEST_CONSTANTS.DATE_ISO_MS},notice,Test CsvFormatter,{},{}`
    )
  })

  it('should respect the "generateFields" option', () => {
    const generateFields = vi.fn(() => ['?'])

    const csvFormatter = new CsvFormatter({
      generateFields
    })

    const record1 = record('info', 'Test CsvFormatter')
    const record2 = record('notice', 'Test CsvFormatter')

    const formatted = csvFormatter.formatBatch([record1, record2])

    expect(generateFields).toHaveBeenCalledTimes(2)
    expect(generateFields).toHaveBeenNthCalledWith(1, record1)
    expect(generateFields).toHaveBeenNthCalledWith(2, record2)
    expect(formatted).toBe(`?\r\n?`)
  })
})
