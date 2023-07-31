import { describe, expect, it } from 'vitest'
import { HostnameProcessor } from '../src/hostname-processor'

const { record } = livyTestGlobals

describe('@livy/hostname-processor', () => {
  it('should add hostname to records', () => {
    expect(HostnameProcessor(record('info'))).toEqual(
      record('info', '', {
        extra: { hostname: 'mock-hostname' }
      })
    )
  })
})
