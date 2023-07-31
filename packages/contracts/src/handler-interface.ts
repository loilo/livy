import { LogLevel } from './log-level.js'
import { LogRecord } from './log-record.js'

/**
 * Describes the structure of a purely asynchronous handler
 */
export interface HandlerInterface {
  /**
   * Checks whether the given record will be handled by this handler.
   *
   * This is mostly done for performance reasons, to avoid calling processors for nothing.
   *
   * Handlers should still check the record levels within handle(), returning false in isHandling()
   * is no guarantee that handle() will not be called, and isHandling() might not be called
   * for a given record.
   *
   * @param level Partial log record containing only a level key
   *
   * @return bool
   */
  isHandling(level: LogLevel): boolean

  /**
   * Handles a record.
   *
   * All records may be passed to this method, and the handler should discard
   * those that it does not want to handle.
   *
   * The return value of this function controls the bubbling process of the handler stack.
   * Unless the bubbling is interrupted (by returning true), the Logger class will keep on
   * calling further handlers in the stack with a given log record.
   *
   * @param  record The record to handle
   * @return `true` means that this handler handled the record, and that bubbling is not permitted.
   *         `false` means the record was either not processed or that this handler allows bubbling.
   */
  handle(record: LogRecord): Promise<boolean | void>

  /**
   * Handles a set of records at once.
   *
   * @param records The records to handle (an array of record arrays)
   */
  handleBatch(records: LogRecord[]): Promise<void>
}

/**
 * Describes the structure of a handler
 */
export interface SyncHandlerInterface extends HandlerInterface {
  /**
   * Handles a record.
   *
   * All records may be passed to this method, and the handler should discard
   * those that it does not want to handle.
   *
   * The return value of this function controls the bubbling process of the handler stack.
   * Unless the bubbling is interrupted (by returning true), the Logger class will keep on
   * calling further handlers in the stack with a given log record.
   *
   * @param  record The record to handle
   * @return `true` means that this handler handled the record, and that bubbling is not permitted.
   *         `false` means the record was either not processed or that this handler allows bubbling.
   */
  handleSync(record: LogRecord): boolean | void

  /**
   * Handles a set of records at once.
   *
   * @param records The records to handle (an array of record arrays)
   */
  handleBatchSync(records: LogRecord[]): void
}
