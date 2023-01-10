import { ClosableHandlerInterface } from '@livy/contracts/lib/closable-handler-interface'
import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import {
  HandlerInterface,
  SyncHandlerInterface
} from '@livy/contracts/lib/handler-interface'
import { LogLevel } from '@livy/contracts/lib/log-level'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { ResettableInterface } from '@livy/contracts/lib/resettable-interface'
import { AbstractBatchHandler } from '@livy/util/lib/handlers/abstract-batch-handler'
import { isClosableHandlerInterface } from '@livy/util/lib/handlers/is-closable-handler-interface'
import { isFormattableHandlerInterface } from '@livy/util/lib/handlers/is-formattable-handler-interface'
import { isSyncHandlerInterface } from '@livy/util/lib/handlers/is-sync-handler-interface'
import { ProcessableHandlerMixin } from '@livy/util/lib/handlers/processable-handler-mixin'
import { isResettableInterface } from '@livy/util/lib/is-resettable-interface'
import { ValidatableSet } from '@livy/util/lib/validatable-set'

export interface GroupHandlerOptions {
  /**
   * Whether this handler allows bubbling of records
   */
  bubble: boolean

  /**
   * Whether handlers must be executed sequentially instead of in parallel
   * Only has an effect in asynchronous execution
   */
  sequential: boolean
}

/**
 * Forwards log records to multiple handlers
 */
export class GroupHandler
  extends ProcessableHandlerMixin(AbstractBatchHandler)
  implements
    ClosableHandlerInterface,
    SyncHandlerInterface,
    ResettableInterface
{
  public bubble: boolean
  public sequential: boolean
  protected handlers: ValidatableSet<HandlerInterface>

  /**
   * @param handlers Array of Handlers.
   * @param bubble   Whether the messages that are handled can bubble up the stack or not
   */
  public constructor(
    handlers: Iterable<HandlerInterface>,
    { bubble = true, sequential = false }: Partial<GroupHandlerOptions> = {}
  ) {
    super()

    this.handlers = new ValidatableSet(handlers)
    this.sequential = sequential
    this.bubble = bubble
  }

  /**
   * @inheritdoc
   */
  public isHandling(level: LogLevel): boolean {
    return this.handlers.some(handler => handler.isHandling(level))
  }

  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    record = this.processRecord(record)

    if (this.sequential) {
      for (const handler of this.handlers) {
        await handler.handle(record)
      }
    } else {
      await Promise.all(
        // eslint-disable-next-line unicorn/prefer-spread
        Array.from(this.handlers, handler => handler.handle(record))
      )
    }

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public handleSync(record: LogRecord) {
    record = this.processRecord(record)

    for (const handler of this.handlers) {
      if (!isSyncHandlerInterface(handler)) {
        throw new Error('Cannot run asynchronous handler in sync mode')
      }

      handler.handleSync(record)
    }

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public async handleBatch(records: LogRecord[]) {
    if (this.processors.size > 0) {
      records = records.map(record => this.processRecord(record))
    }

    if (this.sequential) {
      for (const handler of this.handlers) {
        await handler.handleBatch(records)
      }
    } else {
      await Promise.all(
        // eslint-disable-next-line unicorn/prefer-spread
        Array.from(this.handlers, handler => handler.handleBatch(records))
      )
    }
  }

  /**
   * @inheritdoc
   */
  public handleBatchSync(records: LogRecord[]) {
    if (this.processors.size > 0) {
      records = records.map(record => this.processRecord(record))
    }

    for (const handler of this.handlers) {
      if (!isSyncHandlerInterface(handler)) {
        throw new Error('Cannot run asynchronous handler in sync mode')
      }

      handler.handleBatchSync(records)
    }
  }

  /**
   * @inheritdoc
   */
  public close() {
    for (const handler of this.handlers) {
      if (isClosableHandlerInterface(handler)) {
        handler.close()
      }
    }
  }

  /**
   * @inheritdoc
   */
  public set formatter(formatter: FormatterInterface) {
    for (const handler of this.handlers) {
      if (isFormattableHandlerInterface(handler)) {
        handler.formatter = formatter
      }
    }
  }

  /**
   * @inheritdoc
   */
  public reset() {
    this.resetProcessors()

    for (const handler of this.handlers) {
      if (isResettableInterface(handler)) {
        handler.reset()
      }
    }
  }
}
