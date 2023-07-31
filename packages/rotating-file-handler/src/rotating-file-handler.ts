import { isAbsolute, join, parse } from 'node:path'
import type {
  ClosableHandlerInterface,
  FormatterInterface,
  LogRecord,
} from '@livy/contracts'
import { FileHandler } from '@livy/file-handler'
import { AbstractSyncFormattingProcessingHandler } from '@livy/util/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/handlers/abstract-level-bubble-handler'
import { FormattableHandlerMixin } from '@livy/util/handlers/formattable-handler-mixin'
import {
  DurationUnit,
  MaxAgeStrategy,
  MaxAgeStrategyOptions,
} from './max-age-strategy.js'
import { MaxSizeStrategy, MaxSizeStrategyOptions } from './max-size-strategy.js'
import { RotationStrategyInterface } from './rotation-strategy.js'

interface BaseRotatingFileHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * The formatter to use
   */
  formatter: FormatterInterface

  /**
   * Number of log files to keep at maximum
   */
  maxFiles: number
}

export type RotatingFileHandlerOptions = BaseRotatingFileHandlerOptions &
  (MaxAgeStrategyOptions | MaxSizeStrategyOptions)

/**
 * Stores log records to files that are rotated by datetime or file size
 * and only a limited number of files is kept.
 */
export class RotatingFileHandler
  extends FormattableHandlerMixin(AbstractSyncFormattingProcessingHandler)
  implements ClosableHandlerInterface
{
  private fileHandler!: FileHandler
  private directory: string
  private maxFiles: number
  private rotationStrategyHandler: RotationStrategyInterface

  public constructor(
    pathTemplate: string,
    {
      maxFiles = Number.POSITIVE_INFINITY,
      strategy = 'max-age',
      threshold = 'day',
      formatter,
      ...options
    }: Partial<RotatingFileHandlerOptions> = {},
  ) {
    super(options)

    this.maxFiles = maxFiles
    this.explicitFormatter = formatter

    if (!isAbsolute(pathTemplate)) {
      pathTemplate = join(process.cwd(), pathTemplate)
    }

    const pathData = parse(pathTemplate)

    switch (strategy) {
      case 'max-age':
        this.rotationStrategyHandler = new MaxAgeStrategy(
          pathData.dir,
          pathData.base,
          threshold as DurationUnit,
        )
        break

      case 'max-size':
        this.rotationStrategyHandler = new MaxSizeStrategy(
          pathData.dir,
          pathData.base,
          threshold,
        )
        break

      default:
        throw new Error(`Invalid rotation strategy "${strategy}"`)
    }

    this.directory = pathData.dir
    this.updateFileHandler()
  }

  /**
   * Update the file handler to use the current filename
   */
  private updateFileHandler() {
    if (this.fileHandler !== undefined) {
      this.fileHandler.close()
    }

    this.fileHandler = new FileHandler(
      join(this.directory, this.rotationStrategyHandler.getCurrentFilename()),
      { level: this.level, formatter: this.formatter },
    )
  }

  /**
   * @inheritdoc
   */
  public close() {
    this.rotateIfNeeded()
  }

  /**
   * Rotate if needed
   */
  private rotateIfNeeded() {
    if (this.rotationStrategyHandler.shouldRotate()) {
      this.rotationStrategyHandler.rotate(this.maxFiles)
      this.updateFileHandler()
    }
  }

  /**
   * @inheritdoc
   */
  protected async write(record: LogRecord) {
    this.rotateIfNeeded()
    await this.fileHandler.handle(record)
  }

  /**
   * @inheritdoc
   */
  protected writeSync(record: LogRecord) {
    this.rotateIfNeeded()
    this.fileHandler.handleSync(record)
  }
}
