import type { FormattableHandlerInterface } from '@livy/contracts'
/**
 * Check whether a value implements the FormattableHandlerInterface
 *
 * @param value The value to check
 */
export function isFormattableHandlerInterface(
  value: any,
): value is FormattableHandlerInterface {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const descriptor = Object.getOwnPropertyDescriptor(value, 'formatter')
  if (descriptor) {
    return (
      (typeof descriptor.get === 'function' &&
        typeof descriptor.set === 'function') ||
      (Reflect.has(descriptor, 'value') &&
        typeof descriptor.value === 'object' &&
        descriptor.value !== null)
    )
  } else {
    return typeof value.formatter === 'object' && value.formatter !== null
  }
}
