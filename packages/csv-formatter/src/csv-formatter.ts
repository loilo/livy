import type { LogRecord } from '@livy/contracts'
import { AbstractBatchFormatter } from '@livy/util/formatters/abstract-batch-formatter'
import { sanitizeRegex } from '@livy/util/helpers'

export type FieldGenerator = (record: LogRecord) => string[]

export interface CsvFormatterOptions {
  /**
   * The delimiter to separate columns
   */
  delimiter: string

  /**
   * The string to enclose fields
   */
  enclosure: string

  /**
   * The line terminator string
   */
  eol: string

  /**
   * A callback mapping a log record to a number of columns
   */
  generateFields: FieldGenerator
}

/**
 * Formats log records as CSV lines
 */
export class CsvFormatter extends AbstractBatchFormatter {
  private generateFields: FieldGenerator
  private delimiter: string
  private enclosure: string
  protected batchDelimiter: string

  public constructor({
    generateFields = record => [
      record.datetime.toISO() ?? '',
      record.level,
      record.message,
      JSON.stringify(record.context),
      JSON.stringify(record.extra),
    ],
    delimiter = ',',
    enclosure = '"',
    eol = '\r\n',
  }: Partial<CsvFormatterOptions> = {}) {
    super()

    this.generateFields = generateFields
    this.delimiter = delimiter
    this.enclosure = enclosure
    this.batchDelimiter = eol
  }

  /**
   * @inheritdoc
   */
  public format(record: LogRecord) {
    return String(
      this.generateFields(record)
        .map(field => {
          const hasEnclosure = field.includes(this.enclosure)
          const hasDelimiter = field.includes(this.delimiter)
          const hasLineBreak = field.includes('\n')

          if (hasDelimiter || hasEnclosure || hasLineBreak) {
            return (
              this.enclosure +
              field.replaceAll(
                new RegExp(sanitizeRegex(this.enclosure), 'g'),
                match => `${this.enclosure}${match}${this.enclosure}`,
              ) +
              this.enclosure
            )
          } else {
            return field
          }
        })
        .join(this.delimiter),
    )
  }
}
