import type { HandlerInterface, LogLevel, LogRecord } from '@livy/contracts'
import { isSyncHandlerInterface } from './is-sync-handler-interface.js'

/**
 * Base Handler class providing `handleBatch` and `handleBatchSync`
 * by sequentially hanlding records
 *
 * Note that `handleBatchSync` is a no-op as long as no `handleSync`
 * is implemented by classes extending this handler.
 */
export abstract class AbstractBatchHandler implements HandlerInterface {
  /**
   * @inheritdoc
   */
  public async handleBatch(records: LogRecord[]): Promise<void> {
    for (const record of records) {
      await this.handle(record)
    }
  }

  /**
   * Handles a set of records at once.
   *
   * @param records The records to handle (an array of record arrays)
   */
  public handleBatchSync(records: LogRecord[]): void {
    if (!isSyncHandlerInterface(this)) {
      throw new Error(
        'Cannot invoke handleBatchSync() on an asynchronous handler',
      )
    }

    for (const record of records) {
      this.handleSync(record)
    }
  }

  /**
   * @inheritdoc
   */
  public abstract isHandling(level: LogLevel): boolean

  /**
   * @inheritdoc
   */
  public abstract handle(record: LogRecord): Promise<boolean | void>
}
