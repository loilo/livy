import { LogLevel } from '@livy/contracts/lib/log-level'
import { LineFormatter, LineFormatterOptions } from '@livy/line-formatter'
import { isEmpty } from '@livy/util/lib/helpers'
import chalk from 'chalk'
import { DateTime } from 'luxon'

const emphasize = require('emphasize')

export interface AnsiLineFormatterOptions extends LineFormatterOptions {
  /**
   * Whether records should be highlighted with ANSI escape sequences
   * If not provided (or set to `undefined`), color support is going
   * to be automatically detected
   */
  decorated: boolean | undefined
}

/**
 * Formats log records as single lines with terminal highlighting
 */
export class AnsiLineFormatter extends LineFormatter {
  /**
   * Whether records should be highlighted with ANSI escape sequences
   */
  public decorated: boolean | undefined

  public constructor({
    decorated,
    ...options
  }: Partial<AnsiLineFormatterOptions> = {}) {
    super(options)
    this.decorated = decorated
  }

  /**
   * @inheritdoc
   */
  protected formatDatetime(datetime: DateTime) {
    const timestamp = super.formatDatetime(datetime)

    if (this.shouldDecorate()) {
      return chalk.dim(timestamp)
    } else {
      return timestamp
    }
  }

  /**
   * @inheritdoc
   */
  protected formatLevel(level: LogLevel) {
    const formatted = super.formatLevel(level)

    if (!this.shouldDecorate()) {
      return formatted
    } else {
      let color: string
      switch (level) {
        case 'emergency':
          color = 'red'
          break

        case 'alert':
          color = 'red'
          break

        case 'critical':
          color = 'red'
          break

        case 'error':
          color = 'red'
          break

        case 'warning':
          color = 'yellow'
          break

        case 'notice':
          color = 'blue'
          break

        case 'info':
          color = 'blue'
          break

        case 'debug':
          color = 'blue.dim'
          break

        // istanbul ignore next: This should never happen, but is included for type safety
        default:
          return formatted
      }

      return chalk`{${color} ${formatted}}`
    }
  }

  /**
   * @inheritdoc
   */
  protected formatData(object: any, ignoreEmpty: boolean) {
    if (isEmpty(object) && ignoreEmpty) {
      return ''
    }

    const stringified = super.formatData(object)

    if (this.shouldDecorate()) {
      return emphasize.highlight('json', stringified).value
    } else {
      return stringified
    }
  }

  /**
   * Check whether the formatter should use ANSI codes to decorate log records
   */
  public shouldDecorate() {
    return !!(typeof this.decorated !== 'undefined'
      ? this.decorated
      : chalk.supportsColor)
  }
}
