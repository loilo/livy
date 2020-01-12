import { SyncHandlerInterface } from '@livy/contracts/lib/handler-interface'
/**
 * Check whether a value implements the SyncHandlerInterface
 *
 * @param value The value to check
 */
export function isSyncHandlerInterface(
  value: unknown
): value is SyncHandlerInterface {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).handleSync === 'function' &&
    typeof (value as any).handleBatchSync === 'function'
  )
}
