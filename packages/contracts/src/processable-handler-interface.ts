import { ProcessorInterfaceOrFunction } from './processor-interface'

/**
 * Indicates that the handler may have processors attached
 */
export interface ProcessableHandlerInterface {
  /**
   * Get the processors
   */
  readonly processors: Set<ProcessorInterfaceOrFunction>
}
