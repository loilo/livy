import { SyncHandlerInterface } from '@livy/contracts/lib/handler-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { SyncLoggerInterface } from '@livy/contracts/lib/logger-interface'
import { GatedSet } from '@livy/util/lib/gated-set'
import { isSyncHandlerInterface } from '@livy/util/lib/handlers/is-sync-handler-interface'
import { AbstractLogger, LoggerOptions } from './abstract-logger'

/**
 * A synchrous logger implementation which throws
 * on any attempt to add asynchronous functionality
 */
export class SyncLogger
  extends AbstractLogger<SyncHandlerInterface, void>
  implements SyncLoggerInterface {
  public constructor(
    name: string,
    options?: Partial<LoggerOptions<SyncHandlerInterface>>
  ) {
    super(name, options)

    this._handlers = new GatedSet<SyncHandlerInterface>(
      handler => {
        if (!isSyncHandlerInterface(handler)) {
          throw new Error(
            'Invalid asynchronous handler in synchronous logger instance'
          )
        }
      },
      [...this._handlers]
    )
  }

  /**
   * @inheritdoc
   */
  public withName(name: string) {
    return new SyncLogger(name, {
      handlers: this._handlers,
      processors: this._processors,
      timezone: this._timezone
    })
  }

  /**
   * @inheritdoc
   */
  protected runHandlers(record: LogRecord) {
    for (const handler of [...this._handlers].reverse()) {
      const result = handler.handleSync({ ...record })
      if (result === true) {
        break
      }
    }
  }
}
