import type { LogRecord } from '@livy/contracts'
import { Promisable } from '../types.js'
import { AbstractLevelBubbleHandler } from './abstract-level-bubble-handler.js'
import { FormattableHandlerMixin } from './formattable-handler-mixin.js'
import { ProcessableHandlerMixin } from './processable-handler-mixin.js'

/**
 * Base Handler class providing the Handler structure, including processors and formatters
 * Classes extending it should (in most cases) only implement `write`
 */
export abstract class AbstractFormattingProcessingHandler extends FormattableHandlerMixin(
  ProcessableHandlerMixin(AbstractLevelBubbleHandler),
) {
  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    if (!this.isHandling(record.level)) {
      return false
    }

    record = this.processRecord(record)

    const formatted = this.formatter.format(record)

    await this.write(record, formatted)

    return !this.bubble
  }

  /**
   * Write the record down to the log of the implementing handler
   *
   * @param record
   * @param formatted
   */
  protected abstract write(
    record: LogRecord,
    formatted: string,
  ): Promisable<void>
}

/**
 * Base Handler class providing the Handler structure, including processors and formatters
 * Classes extending it should (in most cases) only implement `writeSync` and possibly `write`
 */
export abstract class AbstractSyncFormattingProcessingHandler extends FormattableHandlerMixin(
  ProcessableHandlerMixin(AbstractLevelBubbleHandler),
) {
  private doHandle(record: LogRecord, mode: 'sync'): boolean
  private doHandle(record: LogRecord, mode: 'async'): Promise<boolean>

  /**
   * Invoke the `write`/`writeSync` method
   *
   * @param record The record to handle
   * @param mode   The mode in which to invoke the write
   */
  private doHandle(record: LogRecord, mode: 'sync' | 'async') {
    if (!this.isHandling(record.level)) {
      return false
    }

    record = this.processRecord(record)

    const formatted = this.formatter.format(record)

    if (mode === 'async') {
      return this.write(record, formatted).then(() => !this.bubble)
    } else {
      this.writeSync(record, formatted)

      return !this.bubble
    }
  }

  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    return this.doHandle(record, 'async')
  }

  /**
   * @inheritdoc
   */
  public handleSync(record: LogRecord) {
    return this.doHandle(record, 'sync')
  }

  /**
   * Write the record down to the log of the implementing handler
   *
   * @param record
   * @param formatted
   */
  protected write(record: LogRecord, formatted: string) {
    return Promise.resolve(this.writeSync(record, formatted))
  }

  /**
   * Write the record down to the log of the implementing handler
   *
   * @param record
   * @param formatted
   */
  protected abstract writeSync(record: LogRecord, formatted: string): void
}
