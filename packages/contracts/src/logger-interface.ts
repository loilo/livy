import { LogLevel } from './log-level.js'
import { LogRecordContext } from './log-record.js'

/**
 * A PSR-3 compatible logger
 *
 * @see https://www.php-fig.org/psr/psr-3/
 */
export interface LoggerInterface {
  /**
   * System is unusable.
   */
  emergency(message: string, context?: LogRecordContext): unknown

  /**
   * Action must be taken immediately.
   *
   * Example: Entire website down, database unavailable, etc. This should
   * trigger the SMS alerts and wake you up.
   */
  alert(message: string, context?: LogRecordContext): unknown

  /**
   * Critical conditions.
   *
   * Example: Application component unavailable, unexpected exception.
   */
  critical(message: string, context?: LogRecordContext): unknown

  /**
   * Runtime errors that do not require immediate action but should typically
   * be logged and monitored.
   */
  error(message: string, context?: LogRecordContext): unknown

  /**
   * Exceptional occurrences that are not errors.
   *
   * Example: Use of deprecated APIs, poor use of an API, undesirable things
   * that are not necessarily wrong.
   */
  warning(message: string, context?: LogRecordContext): unknown

  /**
   * Normal but significant events.
   */
  notice(message: string, context?: LogRecordContext): unknown

  /**
   * Interesting events.
   *
   * Example: User logs in, SQL logs.
   */
  info(message: string, context?: LogRecordContext): unknown

  /**
   * Detailed debug information.
   */
  debug(message: string, context?: LogRecordContext): unknown

  /**
   * Logs with an arbitrary level.
   */
  log(level: LogLevel, message: string, context?: LogRecordContext): unknown
}

/**
 * A PSR-3 compatible, asynchronous logger
 *
 * @see https://www.php-fig.org/psr/psr-3/
 */
export type AsyncLoggerInterface = {
  [P in keyof LoggerInterface]: (
    ...args: Parameters<LoggerInterface[P]>
  ) => Promise<void>
}

/**
 * A PSR-3 compatible, synchronous logger
 *
 * @see https://www.php-fig.org/psr/psr-3/
 */
export type SyncLoggerInterface = {
  [P in keyof LoggerInterface]: (
    ...args: Parameters<LoggerInterface[P]>
  ) => void
}
