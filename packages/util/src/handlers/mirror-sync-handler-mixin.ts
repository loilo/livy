import { SyncHandlerInterface } from '@livy/contracts/lib/handler-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { Mixin } from '../mixin'
import { isSyncHandlerInterface } from './is-sync-handler-interface'

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
        (this as unknown as SyncHandlerInterface).handleSync(record)
      )
    }

    /**
     * @inheritdoc
     */
    public handleBatch(records: LogRecord[]) {
      return Promise.resolve(
        (this as unknown as SyncHandlerInterface).handleBatchSync(records)
      )
    }
  }
})
