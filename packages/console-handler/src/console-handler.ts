import { ConsoleFormatter } from '@livy/console-formatter'
import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { SeverityMap } from '@livy/contracts/lib/log-level'
import { LogRecord } from '@livy/contracts/lib/log-record'
import * as environment from '@livy/util/lib/environment'
import { AbstractSyncFormattingProcessingHandler } from '@livy/util/lib/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/lib/handlers/abstract-level-bubble-handler'

export interface ConsoleHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * The Console object to use
   */
  console: Console

  /**
   * The formatter to use
   */
  formatter: FormatterInterface
}

/**
 * Writes log records to the terminal
 */
export class ConsoleHandler extends AbstractSyncFormattingProcessingHandler {
  private console: Console

  public constructor({
    console,
    formatter,
    ...options
  }: Partial<ConsoleHandlerOptions> = {}) {
    super(options)

    // istanbul ignore next: Environment is hard to test
    if (typeof console === 'undefined') {
      if (environment.isNodeJs) {
        console = global.console
      } else if (environment.isBrowser) {
        console = self.console
      } else if (
        typeof globalThis === 'object' &&
        typeof globalThis.console === 'object'
      ) {
        console = globalThis.console
      } else {
        // eslint-disable-next-line unicorn/prefer-type-error
        throw new Error('Could not find a global console object')
      }
    }

    this.console = console
    this.explicitFormatter = formatter
  }

  /**
   * @inheritdoc
   */
  protected writeSync(record: LogRecord, formatted: string) {
    if (record.severity <= SeverityMap.error) {
      this.console.error('%s', formatted)
    } else if (record.severity === SeverityMap.warning) {
      this.console.warn('%s', formatted)
    } else {
      this.console.log('%s', formatted)
    }
  }

  /**
   * @inheritdoc
   */
  public getDefaultFormatter(): FormatterInterface {
    return new ConsoleFormatter()
  }
}
