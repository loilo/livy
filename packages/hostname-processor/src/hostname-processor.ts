import { LogRecord } from '@livy/contracts/lib/log-record'
import { hostname } from 'os'

/**
 * Injects the running machine's hostname into record.extra
 */
export function HostnameProcessor(record: LogRecord) {
  record.extra.hostname = hostname()
  return record
}
