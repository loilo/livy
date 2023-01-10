import { SyncHandlerInterface } from '@livy/contracts/lib/handler-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { ResettableInterface } from '@livy/contracts/lib/resettable-interface'
import { AbstractLevelBubbleHandler } from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import { MirrorSyncHandlerMixin } from '@livy/util/lib/handlers/mirror-sync-handler-mixin'
import { ProcessableHandlerMixin } from '@livy/util/lib/handlers/processable-handler-mixin'

/**
 * Stores log records in an array; great for debugging
 */
export class ArrayHandler
  extends MirrorSyncHandlerMixin(
    ProcessableHandlerMixin(AbstractLevelBubbleHandler)
  )
  implements SyncHandlerInterface, ResettableInterface
{
  private _records: LogRecord[] = []

  /**
   * @inheritdoc
   */
  public handleSync(record: LogRecord) {
    this._records.push(record)
    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public handleBatchSync(records: LogRecord[]) {
    this._records.push(...records)
  }

  /**
   * Get the stored records
   */
  public get records() {
    return this._records
  }

  /**
   * @inheritdoc
   */
  public reset() {
    this._records.splice(0)
  }
}
