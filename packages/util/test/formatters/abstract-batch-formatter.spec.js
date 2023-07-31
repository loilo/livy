import { describe, expect, it } from 'vitest'
import { AbstractBatchFormatter } from '../../src/formatters/abstract-batch-formatter'

const { record } = livyTestGlobals

describe('@livy/util/lib/formatters/abstract-batch-formatter', () => {
  it('correctly implements "formatBatch" with default newline delimiter', () => {
    class Formatter extends AbstractBatchFormatter {
      format(record) {
        return record.level
      }
    }

    const formatter = new Formatter()

    expect(
      formatter.formatBatch([record('debug'), record('info'), record('notice')])
    ).toBe('debug\ninfo\nnotice')
  })

  it('respects the "batchDelimiter" property', () => {
    class Formatter extends AbstractBatchFormatter {
      constructor() {
        super()
        this.batchDelimiter = '//'
      }

      format(record) {
        return record.level
      }
    }

    const formatter = new Formatter()

    expect(
      formatter.formatBatch([record('debug'), record('info'), record('notice')])
    ).toBe('debug//info//notice')
  })
})
