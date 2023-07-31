import { ProcessorInterfaceOrFunction } from './processor-interface.js'

/**
 * Indicates that the handler may have processors attached
 */
export interface ProcessableHandlerInterface {
  /**
   * Get the processors
   */
  readonly processors: Set<ProcessorInterfaceOrFunction>
}
