import type { FormatterInterface, LogRecord } from '@livy/contracts'
import { EOL } from '@livy/util/environment'
import { AbstractFormattingProcessingHandler } from '@livy/util/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/handlers/abstract-level-bubble-handler'
import * as stream from 'node:stream'

export interface StreamHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * The formatter to use
   */
  formatter: FormatterInterface
}

/**
 * Writes log records to a Node.js stream
 */
export class StreamHandler extends AbstractFormattingProcessingHandler {
  protected stream: stream.Writable

  public constructor(
    stream: stream.Writable,
    { formatter, ...options }: Partial<StreamHandlerOptions> = {},
  ) {
    super(options)

    this.stream = stream
    this.explicitFormatter = formatter
  }

  /**
   * @inheritdoc
   */
  protected write(_record: LogRecord, formatted: string) {
    return new Promise<void>((resolve, reject) => {
      this.stream.write(`${formatted}${EOL}`, error =>
        error ? reject(error) : resolve(),
      )
    })
  }
}
