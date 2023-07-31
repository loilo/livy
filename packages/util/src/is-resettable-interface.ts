import type { ResettableInterface } from '@livy/contracts'
/**
 * Check whether a value implements the ResettableInterface
 *
 * @param value The value to check
 */
export function isResettableInterface(
  value: unknown,
): value is ResettableInterface {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).reset === 'function'
  )
}
