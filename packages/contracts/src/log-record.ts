import type { DateTime } from 'luxon'
import { LogLevel, SeverityLevel } from './log-level.js'

export interface LogRecordContext {
  [key: string]: any
}

export interface LogRecordExtra {
  [key: string]: any
}

/**
 * A log record that is created for each log entry
 */
export interface LogRecord {
  level: LogLevel
  severity: SeverityLevel
  message: string
  context: LogRecordContext
  extra: LogRecordExtra
  channel: string
  datetime: DateTime
}
