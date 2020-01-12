import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { EOL } from '@livy/util/lib/environment'
import { AbstractFormattingProcessingHandler } from '@livy/util/lib/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import * as stream from 'stream'

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
    { formatter, ...options }: Partial<StreamHandlerOptions> = {}
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
        error ? reject(error) : resolve()
      )
    })
  }
}
