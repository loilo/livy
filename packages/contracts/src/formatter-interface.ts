import { LogRecord } from './log-record'

/**
 * Formats log records
 */
export interface FormatterInterface {
  /**
   * Format a log record.
   *
   * @param record A record to format
   * @return The formatted record
   */
  format(record: LogRecord): string

  /**
   * Format a set of log records.
   *
   * @param records A set of records to format
   * @return The formatted set of records
   */
  formatBatch(records: LogRecord[]): string
}
