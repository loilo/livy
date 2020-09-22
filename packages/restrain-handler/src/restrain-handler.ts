import {
  HandlerInterface,
  SyncHandlerInterface
} from '@livy/contracts/lib/handler-interface'
import { LogLevel, SeverityMap } from '@livy/contracts/lib/log-level'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { ResettableInterface } from '@livy/contracts/lib/resettable-interface'
import { FilterHandler } from '@livy/filter-handler'
import { isSyncHandlerInterface } from '@livy/util/lib/handlers/is-sync-handler-interface'
import { isResettableInterface } from '@livy/util/lib/is-resettable-interface'

/**
 * An activation strategy function
 */
export interface ActivationStrategy {
  (record: LogRecord): boolean
}

export interface RestrainHandlerOptions {
  /**
   * Strategy which determines when this handler takes action
   */
  activationStrategy: LogLevel | ActivationStrategy

  /**
   * Whether the messages that are handled can bubble up the stack or not
   */
  bubble: boolean

  /**
   * How many entries should be buffered at most
   * When the buffer exceeds this size, its oldest items are discarded
   */
  bufferSize: number

  /**
   * Whether the handler should stop buffering after being triggered
   */
  stopBuffering: boolean
}

/**
 * Buffers all records until an activation condition is reached
 *
 * The advantage of this approach is that you don't get any clutter in your log files.
 * Only incidents which actually trigger an error (or whatever your activation condition is) will be
 * in the logs, but they will contain all records, not only those above the level threshold.
 */
export class RestrainHandler
  extends FilterHandler
  implements SyncHandlerInterface, ResettableInterface {
  protected buffering = true
  protected bufferSize: number
  protected stopBuffering: boolean
  protected buffer: LogRecord[] = []

  /**
   * Whether this handler allows bubbling of records
   */
  public bubble = true

  /**
   * @param handler Wrapped handler
   * @param options Options regarding the restraining
   */
  public constructor(
    handler: HandlerInterface,
    {
      activationStrategy = 'warning',
      bufferSize = Infinity,
      stopBuffering = false,
      bubble = true
    }: Partial<RestrainHandlerOptions> = {}
  ) {
    super(
      handler,
      typeof activationStrategy === 'function'
        ? activationStrategy
        : (record: LogRecord) =>
            record.severity <= SeverityMap[activationStrategy]
    )

    this.bufferSize = bufferSize
    this.bubble = bubble
    this.stopBuffering = stopBuffering
  }

  /**
   * Manually activate this logger regardless of the activation strategy
   *
   * @param mode Whether to invoke the contained handler synchronously or asynchronously
   */
  public activate(mode: 'sync' | 'async') {
    if (this.stopBuffering) {
      this.buffering = false
    }

    const buffer = this.buffer
    this.buffer = []

    if (mode === 'async') {
      return this.handler.handleBatch(buffer)
    } else {
      if (isSyncHandlerInterface(this.handler)) {
        return this.handler.handleBatchSync(buffer)
      } else {
        throw new Error('Cannot activate asynchronous handler in sync mode')
      }
    }
  }

  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    record = this.processRecord(record)

    if (this.buffering) {
      this.buffer.push(record)
      if (this.buffer.length > this.bufferSize) {
        this.buffer.shift()
      }

      if (this.test(record)) {
        this.activate('async')
      }
    } else {
      await this.handler.handle(record)
    }

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public handleSync(record: LogRecord) {
    record = this.processRecord(record)

    if (this.buffering) {
      this.buffer.push(record)
      if (this.buffer.length > this.bufferSize) {
        this.buffer.shift()
      }

      if (this.test(record)) {
        this.activate('sync')
      }
    } else {
      if (isSyncHandlerInterface(this.handler)) {
        this.handler.handleSync(record)
      } else {
        throw new Error('Cannot activate asynchronous handler in sync mode')
      }
    }

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public close() {
    if (this.buffer.length > 0) {
      super.close()
    }
  }

  /**
   * Clears the buffer without flushing any messages down to the wrapped handler and re-enables buffering
   */
  public reset() {
    this.buffer = []
    this.buffering = true

    this.resetProcessors()

    if (isResettableInterface(this.handler)) {
      this.handler.reset()
    }
  }
}
