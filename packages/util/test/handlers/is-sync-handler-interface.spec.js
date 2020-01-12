const {
  isSyncHandlerInterface
} = require('../../src/handlers/is-sync-handler-interface')

describe('@livy/util/lib/handlers/is-sync-handler-interface', () => {
  it('should recognize handleSynctable objects', () => {
    expect(
      isSyncHandlerInterface({ handleSync() {}, handleBatchSync() {} })
    ).toBe(true)
  })

  it('should reject primitives', () => {
    expect(isSyncHandlerInterface(1)).toBe(false)
    expect(isSyncHandlerInterface(NaN)).toBe(false)
    expect(isSyncHandlerInterface(true)).toBe(false)
    expect(isSyncHandlerInterface('foo')).toBe(false)
  })

  it('should reject null', () => {
    expect(isSyncHandlerInterface(null)).toBe(false)
  })

  it('should reject missing or non-function "handleSync" properties', () => {
    expect(isSyncHandlerInterface({ handleBatchSync() {} })).toBe(false)
    expect(
      isSyncHandlerInterface({ handleSync: {}, handleBatchSync() {} })
    ).toBe(false)
    expect(
      isSyncHandlerInterface({ handleSync: null, handleBatchSync() {} })
    ).toBe(false)
  })

  it('should reject missing or non-function "handleBatchSync" properties', () => {
    expect(isSyncHandlerInterface({ handleSync() {} })).toBe(false)
    expect(
      isSyncHandlerInterface({ handleSync() {}, handleBatchSync: {} })
    ).toBe(false)
    expect(
      isSyncHandlerInterface({ handleSync() {}, handleBatchSync: null })
    ).toBe(false)
  })
})
