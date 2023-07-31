import { hostname } from 'node:os'
import type { LogRecord } from '@livy/contracts'

/**
 * Injects the running machine's hostname into record.extra
 */
export function HostnameProcessor(record: LogRecord) {
  record.extra.hostname = hostname()
  return record
}
