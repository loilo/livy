import { HandlerInterface } from '@livy/contracts/lib/handler-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { AsyncLoggerInterface } from '@livy/contracts/lib/logger-interface'
import { AbstractLogger } from './abstract-logger'

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
      timezone: this._timezone
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
