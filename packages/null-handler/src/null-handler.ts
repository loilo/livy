import type { LogLevel, LogRecord, SyncHandlerInterface } from '@livy/contracts'
import { SeverityMap } from '@livy/contracts'
import { AbstractBatchHandler } from '@livy/util/handlers/abstract-batch-handler'
import { RespectLevelMixin } from '@livy/util/handlers/respect-level-mixin'

/**
 * Blackhole
 *
 * Any record it can handle will be thrown away. This can be used
 * to put on top of an existing stack to override it temporarily.
 */
export class NullHandler
  extends RespectLevelMixin(AbstractBatchHandler)
  implements SyncHandlerInterface
{
  public constructor(level: LogLevel = 'debug') {
    super()
    this.level = level
  }

  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    return this.handleSync(record)
  }

  /**
   * @inheritdoc
   */
  public handleSync(record: LogRecord) {
    return record.severity <= SeverityMap[this.level]
  }
}
