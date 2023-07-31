import { ConsoleFormatter } from '@livy/console-formatter'
import type { FormatterInterface, LogRecord } from '@livy/contracts'
import { SeverityMap } from '@livy/contracts'
import * as environment from '@livy/util/environment'
import { AbstractSyncFormattingProcessingHandler } from '@livy/util/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/handlers/abstract-level-bubble-handler'

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

    /* c8 ignore start: Environment is hard to test for coverage */
    if (console === undefined) {
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
    /* c8 ignore stop */

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
