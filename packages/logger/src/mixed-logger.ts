import type {
  HandlerInterface,
  LogRecord,
  SyncLoggerInterface,
} from '@livy/contracts'
import { isSyncHandlerInterface } from '@livy/util/handlers/is-sync-handler-interface'
import { AbstractLogger } from './abstract-logger.js'

/**
 * A mixed sync/async logger implementation
 *
 * It executes asynchronous handlers but does not await their results nor does it
 * respect their bubbling behavior or handle their errors
 */
export class MixedLogger
  extends AbstractLogger<HandlerInterface, void>
  implements SyncLoggerInterface
{
  /**
   * @inheritdoc
   */
  public withName(name: string) {
    return new MixedLogger(name, {
      handlers: this._handlers,
      processors: this._processors,
      timezone: this._timezone,
    })
  }

  /**
   * @inheritdoc
   */
  protected runHandlers(record: LogRecord) {
    for (const handler of [...this._handlers].reverse()) {
      if (isSyncHandlerInterface(handler)) {
        const result = handler.handleSync({ ...record })
        if (result === true) {
          break
        }
      } else {
        handler.handle({ ...record }).catch(error => {
          console.warn('Asynchronous handler failed to execute: %o', error)
        })
      }
    }
  }
}
