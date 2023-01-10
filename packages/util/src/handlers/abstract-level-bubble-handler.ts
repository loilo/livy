import { LogLevel } from '@livy/contracts/lib/log-level'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { AbstractBatchHandler } from './abstract-batch-handler'
import { RespectLevelMixin } from './respect-level-mixin'

export interface AbstractLevelBubbleHandlerOptions {
  /**
   * The minimum activation level for this handler
   */
  level: LogLevel

  /**
   * Whether this handler allows bubbling of records
   */
  bubble: boolean
}

/**
 * Base Handler class providing basic a `bubble` option and basic `level` support
 */
export abstract class AbstractLevelBubbleHandler extends RespectLevelMixin(
  AbstractBatchHandler
) {
  /**
   * Whether this handler allows bubbling of records
   */
  public bubble = true

  /**
   * @param level  The minimum logging level at which this handler will be triggered
   * @param bubble Whether the messages that are handled can bubble up the stack or not
   */
  public constructor({
    level = 'debug',
    bubble = true
  }: Partial<AbstractLevelBubbleHandlerOptions> = {}) {
    super()

    this.level = level
    this.bubble = bubble
  }

  /**
   * @inheritdoc
   */
  public abstract handle(record: LogRecord): Promise<boolean | void>
}
