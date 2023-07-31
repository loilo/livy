import type {
  LogRecord,
  ResettableInterface,
  SyncHandlerInterface,
} from '@livy/contracts'
import { AbstractLevelBubbleHandler } from '@livy/util/handlers/abstract-level-bubble-handler'
import { MirrorSyncHandlerMixin } from '@livy/util/handlers/mirror-sync-handler-mixin'
import { ProcessableHandlerMixin } from '@livy/util/handlers/processable-handler-mixin'

/**
 * Stores log records in an array; great for debugging
 */
export class ArrayHandler
  extends MirrorSyncHandlerMixin(
    ProcessableHandlerMixin(AbstractLevelBubbleHandler),
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
