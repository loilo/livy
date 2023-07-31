import type { ProcessableHandlerInterface } from '@livy/contracts'
/**
 * Check whether a value implements the `ProcessableHandlerInterface`
 *
 * @param value The value to check
 */
export function isProcessableHandlerInterface(
  value: any,
): value is ProcessableHandlerInterface {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.processors instanceof Set
  )
}
