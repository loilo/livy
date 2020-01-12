import { HandlerInterface } from './handler-interface'

/**
 * Indicates that the handler may want to perform cleanup tasks
 */
export interface ClosableHandlerInterface extends HandlerInterface {
  /**
   * Ends a log cycle and frees all resources used by handlers.
   *
   * Closing a Handler means flushing all buffers and freeing any open resources/handles.
   * Handlers that have been closed should be able to accept log records again and re-open
   * themselves on demand, but this may not always be possible depending on implementation.
   */
  close(): void
}
