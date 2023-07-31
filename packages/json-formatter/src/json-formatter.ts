import type { LogRecord } from '@livy/contracts'
import { EOL } from '@livy/util/environment'
import { AbstractBatchFormatter } from '@livy/util/formatters/abstract-batch-formatter'
import { IncludedRecordProperties } from '@livy/util/formatters/included-record-properties'

/* eslint-disable @typescript-eslint/no-redeclare */
const BATCH_MODE_NEWLINES = Symbol('BATCH_MODE_NEWLINES')
type BATCH_MODE_NEWLINES = typeof BATCH_MODE_NEWLINES
const BATCH_MODE_JSON = Symbol('BATCH_MODE_JSON')
type BATCH_MODE_JSON = typeof BATCH_MODE_JSON
/* eslint-enable @typescript-eslint/no-redeclare */

type BatchMode = BATCH_MODE_NEWLINES | BATCH_MODE_JSON

export interface JsonFormatterOptions {
  /**
   * Which log record properties to include in the output
   */
  include: Partial<IncludedRecordProperties>

  /**
   * How to combine multiple records when batch-formatting
   */
  batchMode: BatchMode
}

/**
 * Serializes log records as JSON
 */
export class JsonFormatter extends AbstractBatchFormatter {
  /**
   * Use newline characters to delimit multiple lines when batch-formatting
   */
  public static readonly BATCH_MODE_NEWLINES: BATCH_MODE_NEWLINES =
    BATCH_MODE_NEWLINES

  /**
   * Batch-format records as a JSON array
   */
  public static readonly BATCH_MODE_JSON: BATCH_MODE_JSON = BATCH_MODE_JSON

  /**
   * Which log record properties to include in the output
   */
  public include: IncludedRecordProperties

  /**
   * How to combine multiple records when batch-formatting
   */
  public batchMode: BatchMode

  public constructor({
    include = {},
    batchMode = BATCH_MODE_NEWLINES,
  }: Partial<JsonFormatterOptions> = {}) {
    super()

    this.include = {
      datetime: true,
      channel: true,
      level: true,
      severity: true,
      message: true,
      context: true,
      extra: true,
      ...include,
    }
    this.batchMode = batchMode
  }

  /**
   * @inheritdoc
   */
  public format(record: LogRecord) {
    const recordCopy = { ...record }
    for (const key in this.include) {
      if (this.include[key as keyof IncludedRecordProperties] === false) {
        delete recordCopy[key as keyof IncludedRecordProperties]
      }
    }
    return JSON.stringify(record)
  }

  /**
   * @inheritdoc
   */
  public formatBatch(records: LogRecord[]) {
    if (this.batchMode === BATCH_MODE_JSON) {
      return `[${records.map(record => this.format(record)).join(',')}]`
    } else {
      return records.map(record => this.format(record)).join(EOL)
    }
  }
}
