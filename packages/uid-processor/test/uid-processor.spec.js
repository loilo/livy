import { describe, expect, it } from 'vitest'
import { UidProcessor } from '../src/uid-processor'

const { record } = livyTestGlobals

describe('@livy/uid-processor', () => {
  it('should add unique IDs to records (14-character by default)', () => {
    const processor = new UidProcessor()
    expect(processor.process(record('info'))).toEqual(
      record('info', '', {
        extra: { uid: expect.stringMatching(/^[0-9a-f]{14}$/) }
      })
    )
  })

  it('should add unique IDs of the configured length to records', () => {
    const processor = new UidProcessor(5)
    expect(processor.process(record('info'))).toEqual(
      record('info', '', {
        extra: { uid: expect.stringMatching(/^[0-9a-f]{10}$/) }
      })
    )
  })

  it('should fail to accept invalid UID length', () => {
    expect(() => {
      new UidProcessor(0)
    }).toThrowError(
      new Error('Invalid UID length 0: must be a positive integer')
    )

    expect(() => {
      new UidProcessor(null)
    }).toThrowError(
      new Error('Invalid UID length null: must be a positive integer')
    )
  })

  it('should report UID', () => {
    const processor = new UidProcessor()

    const uid = processor.uid
    const sameUid = processor.uid

    expect(uid).toMatch(/^[0-9a-f]{14}$/)
    expect(sameUid).toBe(uid)
    expect(processor.process(record('info'))).toEqual(
      record('info', '', {
        extra: { uid }
      })
    )
  })

  it('should be resettable', () => {
    const processor = new UidProcessor()

    const uid1 = processor.uid
    processor.reset()
    const uid2 = processor.uid

    expect(uid1).not.toBe(uid2)
  })
})
