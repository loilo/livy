import type { ClosableHandlerInterface } from '@livy/contracts'
/**
 * Check whether a value implements the ClosableHandlerInterface
 *
 * @param value The value to check
 */
export function isClosableHandlerInterface(
  value: unknown,
): value is ClosableHandlerInterface {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).close === 'function'
  )
}
