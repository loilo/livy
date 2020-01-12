import { LogRecord } from './log-record'

/**
 * A processor object with a `process` method
 * Useful for stateful processors, mostly represented as classes
 */
export interface ProcessorInterface {
  /**
   * Apply the processor to a log record
   *
   * @param record The record to apply to
   */
  process(record: LogRecord): LogRecord
}

/**
 * A processor function
 */
export interface ProcessorFunction {
  (record: LogRecord): LogRecord
}

/**
 * A processor object or function
 */
export type ProcessorInterfaceOrFunction =
  | ProcessorInterface
  | ProcessorFunction
