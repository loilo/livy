import { FormatterInterface } from './formatter-interface.js'

/**
 * Indicates that the handler has a formatter attached
 *
 * Note: By convention, handlers implementing this interface should have a
 * `formatter` option in their constructor to set the formatter initally
 */
export interface FormattableHandlerInterface {
  /**
   * The formatter used by the handler
   */
  formatter: FormatterInterface
}
