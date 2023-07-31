import { afterEach, describe, expect, it } from 'vitest'
import { ProcessIdProcessor } from '../src/process-id-processor'

const { record, date } = livyTestGlobals

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
