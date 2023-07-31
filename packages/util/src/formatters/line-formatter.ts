/**
 * Note: The very basic line formatter is implemented in the @livy/util package to avoid circular dependencies
 */

import type { LogLevel, LogRecord, SeverityLevel } from '@livy/contracts'
import { DateTime } from 'luxon'
import { isEmpty } from '../helpers.js'
import { Stringified } from '../types.js'
import { AbstractBatchFormatter } from './abstract-batch-formatter.js'
import { IncludedRecordProperties } from './included-record-properties.js'

/**
 * Formats log records as single lines
 */
export interface LineFormatterOptions {
  /**
   * Which log record properties to include in the output
   */
  include: Partial<IncludedRecordProperties>

  /**
   * Whether to omit empty context objects (only if extra is empty as well)
   */
  ignoreEmptyContext: boolean

  /**
   * Whether to omit empty extra objects
   */
  ignoreEmptyExtra: boolean
}

/**
 * Serializes a log entry into a single line
 */
export class LineFormatter extends AbstractBatchFormatter {
  /**
   * Which log record properties to include in the output
   */
  public include: IncludedRecordProperties

  /**
   * Whether to omit empty context data (if extra is empty as well)
   */
  public ignoreEmptyContext: boolean

  /**
   * Whether to omit empty extra data
   */
  public ignoreEmptyExtra: boolean

  public constructor({
    include = {},
    ignoreEmptyContext = false,
    ignoreEmptyExtra = true,
  }: Partial<LineFormatterOptions> = {}) {
    super()

    this.ignoreEmptyContext = ignoreEmptyContext
    this.ignoreEmptyExtra = ignoreEmptyExtra
    this.include = {
      datetime: true,
      channel: false,
      level: true,
      severity: false,
      message: true,
      context: true,
      extra: true,
      ...include,
    }
  }

  /**
   * @inheritdoc
   */
  public format(record: LogRecord) {
    const formattedExtra = this.include.extra
      ? this.formatExtra(record.extra, this.ignoreEmptyExtra)
      : ''

    return this.assembleFormattedRecord({
      channel: this.include.channel ? this.formatChannel(record.channel) : '',
      datetime: this.include.datetime
        ? this.formatDatetime(record.datetime)
        : '',
      level: this.include.level ? this.formatLevel(record.level) : '',
      severity: this.include.severity
        ? this.formatSeverityMap(record.severity)
        : '',
      message: this.include.message
        ? this.formatMessage(record.message).replaceAll(/\s*\n\s*/g, ' / ')
        : '',
      context: this.include.context
        ? this.formatContext(
            record.context,
            this.ignoreEmptyContext && formattedExtra.length === 0,
          )
        : '',
      extra: this.include.extra ? formattedExtra : '',
    })
  }

  /**
   * Assemble the formatted parts of a record into a string
   *
   * @param parts The formatted parts to assemble
   */
  protected assembleFormattedRecord({
    datetime,
    channel,
    level,
    severity,
    message,
    context,
    extra,
  }: Stringified<LogRecord>) {
    return `${datetime}${channel}${level}${severity}${message}${context}${extra}`
  }

  /**
   * Format a record's datetime
   *
   * @param datetime The DateTime object to format
   */
  protected formatDatetime(datetime: DateTime) {
    return datetime.toFormat('yyyy-MM-dd HH:mm:ss ')
  }

  /**
   * Format a record's level
   *
   * @param level The level to format
   */
  protected formatLevel(level: LogLevel) {
    return `${level.toUpperCase()} `
  }

  /**
   * Format a record's severity
   *
   * @param severity The severity to format
   */
  protected formatSeverityMap(severity: SeverityLevel) {
    return `[${severity}] `
  }

  /**
   * Format a record's channel
   *
   * @param channel The channel to format
   */
  protected formatChannel(channel: string) {
    return channel + ' '
  }

  /**
   * Format a record's message
   *
   * @param message The message to format
   */
  protected formatMessage(message: string) {
    return message
  }

  /**
   * Format a record's context object
   *
   * @param context     The context to format
   * @param ignoreEmpty Whether to return an empty serialization for an empty context object
   */
  protected formatContext(context: any, ignoreEmpty = true) {
    return this.formatData(context, ignoreEmpty)
  }

  /**
   * Format a record's extra object
   *
   * @param context     The extra to format
   * @param ignoreEmpty Whether to return an empty serialization for an empty extra object
   */
  protected formatExtra(extra: any, ignoreEmpty = true) {
    return this.formatData(extra, ignoreEmpty)
  }

  /**
   * Format a single record property
   *
   * @param data        The data to format
   * @param ignoreEmpty Whether to return an empty serialization for empty data
   */
  protected formatData(data: any, ignoreEmpty = true) {
    if (isEmpty(data) && ignoreEmpty) {
      return ''
    } else {
      return ' ' + JSON.stringify(data)
    }
  }
}
