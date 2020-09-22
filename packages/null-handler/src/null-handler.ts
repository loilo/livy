import { SyncHandlerInterface } from '@livy/contracts/lib/handler-interface'
import { LogLevel, SeverityMap } from '@livy/contracts/lib/log-level'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { AbstractBatchHandler } from '@livy/util/lib/handlers/abstract-batch-handler'
import { RespectLevelMixin } from '@livy/util/lib/handlers/respect-level-mixin'

/**
 * Blackhole
 *
 * Any record it can handle will be thrown away. This can be used
 * to put on top of an existing stack to override it temporarily.
 */
export class NullHandler
  extends RespectLevelMixin(AbstractBatchHandler)
  implements SyncHandlerInterface {
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
