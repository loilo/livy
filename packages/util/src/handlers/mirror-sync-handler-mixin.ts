import type { LogRecord, SyncHandlerInterface } from '@livy/contracts'
import { Mixin } from '../mixin.js'
import { isSyncHandlerInterface } from './is-sync-handler-interface.js'

/**
 * Mixin which implements the `SyncHandlerInterface` by making the
 * `handle`/`handleBatchSync` method mirroring the `handle`/`handleBatch` method
 */
export const MirrorSyncHandlerMixin = Mixin(BaseClass => {
  return class MirrorSyncHandlerMixin extends BaseClass {
    public constructor(...args: any[]) {
      super(...args)

      if (!isSyncHandlerInterface(this)) {
        throw new Error('Cannot use MirrorSyncHandlerMixin on an async handler')
      }
    }

    /**
     * @inheritdoc
     */
    public handle(record: LogRecord) {
      return Promise.resolve(
        (this as unknown as SyncHandlerInterface).handleSync(record),
      )
    }

    /**
     * @inheritdoc
     */
    public handleBatch(records: LogRecord[]) {
      return Promise.resolve(
        (this as unknown as SyncHandlerInterface).handleBatchSync(records),
      )
    }
  }
})
