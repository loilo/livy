import { MirrorSyncHandlerMixin } from '../../src/handlers/mirror-sync-handler-mixin'

describe('@livy/util/lib/handlers/mirror-sync-handler-mixin', () => {
  it('should correctly mix in async handle/handleBatch methods', async () => {
    const mockHandleSync = jest.fn()
    const mockHandleBatchSync = jest.fn()

    class Handler extends MirrorSyncHandlerMixin(class {}) {
      handleSync(record) {
        mockHandleSync(record)
      }

      handleBatchSync(records) {
        mockHandleBatchSync(records)
      }
    }

    const handler = new Handler()

    await handler.handle(record('debug'))
    await handler.handleBatch(record('info'))

    expect(mockHandleSync).toHaveBeenCalledTimes(1)
    expect(mockHandleSync).toHaveBeenLastCalledWith(record('debug'))
    expect(mockHandleBatchSync).toHaveBeenCalledTimes(1)
    expect(mockHandleBatchSync).toHaveBeenLastCalledWith(record('info'))
  })

  it('should fail to be applied to an incomplete handler', () => {
    expect(() => {
      class Handler extends MirrorSyncHandlerMixin(class {}) {}
      new Handler()
    }).toThrowError(
      new Error('Cannot use MirrorSyncHandlerMixin on an async handler')
    )
  })
})
