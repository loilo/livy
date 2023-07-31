import type { HandlerInterface, SyncHandlerInterface } from '@livy/contracts'
import { LoggerOptions } from './abstract-logger.js'
import { AsyncLogger } from './async-logger.js'
import { MixedLogger } from './mixed-logger.js'
import { SyncLogger } from './sync-logger.js'

type AsyncLoggerFactoryOptions = LoggerOptions<HandlerInterface> & {
  mode: 'async'
}
type SyncLoggerFactoryOptions = LoggerOptions<SyncHandlerInterface> & {
  mode: 'sync'
}
type MixedLoggerFactoryOptions = LoggerOptions<HandlerInterface> & {
  mode: 'mixed'
}

export type LoggerFactoryOptions =
  | AsyncLoggerFactoryOptions
  | SyncLoggerFactoryOptions
  | MixedLoggerFactoryOptions

/**
 * Create a logger instance
 *
 * @param name    The name of the logger
 * @param options The options for the logger
 */
export function createLogger(
  name: string,
  { mode = 'mixed', ...options }: Partial<LoggerFactoryOptions> = {},
) {
  switch (mode) {
    case 'sync':
      return new SyncLogger(
        name,
        options as LoggerOptions<SyncHandlerInterface>,
      )

    case 'async':
      return new AsyncLogger(name, options as LoggerOptions<HandlerInterface>)

    case 'mixed':
      return new MixedLogger(name, options as LoggerOptions<HandlerInterface>)

    default:
      throw new Error(
        `Invalid logging mode "${mode}". Use one of "sync", "async" or "mixed".`,
      )
  }
}
