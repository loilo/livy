import type { LogRecord } from '@livy/contracts'

/**
 * Injects the current process ID into record.extra
 */
export function ProcessIdProcessor(record: LogRecord) {
  record.extra.pid = process.pid
  return record
}
