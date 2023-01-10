import { SyncHandlerInterface } from '@livy/contracts/lib/handler-interface'
import { AbstractBatchHandler } from '@livy/util/lib/handlers/abstract-batch-handler'

/**
 * No-op
 *
 * Handles anything, but does nothing, and does not stop bubbling to the rest of the stack.
 * This can be used for testing, or to disable a handler when overriding a configuration without
 * influencing the rest of the stack.
 */
export class NoopHandler
  extends AbstractBatchHandler
  implements SyncHandlerInterface
{
  /**
   * @inheritdoc
   */
  public isHandling() {
    return true
  }

  /**
   * @inheritdoc
   */
  public async handle() {
    return false
  }

  /**
   * @inheritdoc
   */
  public handleSync() {
    return false
  }
}
