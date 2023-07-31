import type {
  ClosableHandlerInterface,
  HandlerInterface,
  LogLevel,
  LogRecord,
  ResettableInterface,
  SyncHandlerInterface,
} from '@livy/contracts'
import { AbstractBatchHandler } from '@livy/util/handlers/abstract-batch-handler'
import { isClosableHandlerInterface } from '@livy/util/handlers/is-closable-handler-interface'
import { isSyncHandlerInterface } from '@livy/util/handlers/is-sync-handler-interface'
import { ProcessableHandlerMixin } from '@livy/util/handlers/processable-handler-mixin'
import { getObviousTypeName } from '@livy/util/helpers'
import { isResettableInterface } from '@livy/util/is-resettable-interface'

export interface FilterHandlerOptions {
  /**
   * Whether this handler allows bubbling of records
   */
  bubble: boolean
}

/**
 * A test gating the provided log record
 */
type FilterTest = (record: LogRecord) => boolean

/**
 * Simple handler wrapper that filters records based test callback
 */
export class FilterHandler
  extends ProcessableHandlerMixin(AbstractBatchHandler)
  implements
    SyncHandlerInterface,
    ResettableInterface,
    ClosableHandlerInterface
{
  protected handler: HandlerInterface
  protected test: FilterTest
  protected acceptedLevels: LogLevel[] = []

  /**
   * Whether this handler allows bubbling of records
   */
  public bubble = true

  public constructor(
    handler: HandlerInterface,
    test: FilterTest,
    { bubble = true }: Partial<FilterHandlerOptions> = {},
  ) {
    super()

    if (typeof test !== 'function') {
      throw new TypeError(
        `Filter test must be a function, got ${getObviousTypeName(test)}`,
      )
    }

    this.bubble = bubble
    this.handler = handler
    this.test = test
  }

  /**
   * @inheritdoc
   */
  public isHandling(_level: LogLevel) {
    return true
  }

  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    if (!this.test(record)) {
      return false
    }

    record = this.processRecord(record)

    await this.handler.handle(record)

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public handleSync(record: LogRecord) {
    if (!this.test(record)) {
      return false
    }

    record = this.processRecord(record)

    if (isSyncHandlerInterface(this.handler)) {
      this.handler.handleSync(record)
    } else {
      throw new Error('Cannot activate asynchronous handler in sync mode')
    }

    return !this.bubble
  }

  /**
   * Run multiple handlers
   *
   * @param records The records to handle
   */
  private filterRecords(records: LogRecord[]) {
    const filtered: LogRecord[] = []
    for (const record of records) {
      if (this.test(record)) {
        filtered.push(record)
      }
    }
    return filtered
  }

  /**
   * @inheritdoc
   */
  public async handleBatch(records: LogRecord[]) {
    await this.handler.handleBatch(this.filterRecords(records))
  }

  /**
   * @inheritdoc
   */
  public handleBatchSync(records: LogRecord[]) {
    if (isSyncHandlerInterface(this.handler)) {
      this.handler.handleBatchSync(this.filterRecords(records))
    } else {
      throw new Error('Cannot activate asynchronous handler in sync mode')
    }
  }

  /**
   * @inheritdoc
   */
  public close() {
    if (isClosableHandlerInterface(this.handler)) {
      this.handler.close()
    }
  }

  /**
   * @inheritdoc
   */
  public reset() {
    this.resetProcessors()

    if (isResettableInterface(this.handler)) {
      this.handler.reset()
    }
  }
}
