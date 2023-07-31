import type {
  AsyncLoggerInterface,
  HandlerInterface,
  LogRecord,
} from '@livy/contracts'
import { AbstractLogger } from './abstract-logger.js'

/**
 * An asynchrous logger implementation
 */
export class AsyncLogger
  extends AbstractLogger<HandlerInterface, Promise<void>>
  implements AsyncLoggerInterface
{
  /**
   * @inheritdoc
   */
  public withName(name: string) {
    return new AsyncLogger(name, {
      handlers: this._handlers,
      processors: this._processors,
      timezone: this._timezone,
    })
  }

  /**
   * @inheritdoc
   */
  protected async runHandlers(record: LogRecord) {
    for (const handler of this._handlers) {
      const result = await handler.handle({ ...record })
      if (result === true) {
        break
      }
    }
  }
}
