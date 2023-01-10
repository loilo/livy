import { replaceTokens, sanitizeRegex } from '@livy/util/lib/helpers'
import { existsSync } from 'fs'
import { DateTime } from 'luxon'
import { BaseStrategy } from './base-strategy'
import { RotationStrategyInterface } from './rotation-strategy'

export interface MaxAgeStrategyOptions {
  /**
   * The strategy name
   */
  strategy: 'max-age'

  /**
   * The duration unit that separates individual log files
   */
  threshold: DurationUnit
}

export type DurationUnit = 'minute' | 'hour' | 'day' | 'month' | 'year'
type DateFormatter = (datetime: DateTime) => string

/**
 * Separates log files by the datetime attached to log records thus creates
 * a new file every year/month/day/hour/minute
 */
export class MaxAgeStrategy
  extends BaseStrategy<MaxAgeStrategyOptions>
  implements RotationStrategyInterface
{
  private cachedFilename?: string
  private durationUnit: DurationUnit
  private dateFormatter: DateFormatter

  constructor(
    directory: string,
    filenameTemplate: string,
    threshold: DurationUnit
  ) {
    if (!filenameTemplate.includes('%date%')) {
      throw new Error(
        `Invalid filename template "${filenameTemplate}", must contain the %date% token.`
      )
    }

    super(directory, filenameTemplate, threshold)

    this.durationUnit = threshold
    this.dateFormatter = this.getDateFormatter(threshold)
  }

  /**
   * Get a regular expression matching log file names
   */
  protected getFilenameRegex() {
    return new RegExp(
      `^${replaceTokens(sanitizeRegex(this.filenameTemplate), {
        date: '.+?'
      })}$`
    )
  }

  /**
   * Get the date format for a unit
   *
   * @param unit The unit to get the date format for
   */
  private getDateFormatter(unit: DurationUnit): DateFormatter {
    return {
      minute: (datetime: DateTime) => datetime.toFormat('yyyy-MM-dd_HH-mm'),
      hour: (datetime: DateTime) => datetime.toFormat('yyyy-MM-dd_HH'),
      day: (datetime: DateTime) => datetime.toFormat('yyyy-MM-dd'),
      month: (datetime: DateTime) => datetime.toFormat('yyyy-MM'),
      year: (datetime: DateTime) => datetime.toFormat('yyyy')
    }[unit]
  }

  /**
   * Get the name of the current file
   */
  public getCurrentFilename() {
    const date = this.getStartOfDurationUnit()

    return replaceTokens(this.filenameTemplate, {
      date: this.dateFormatter(date)
    })
  }

  /**
   * Get the current date set to a unit-relative starting point
   */
  protected getStartOfDurationUnit() {
    return DateTime.local().startOf(this.durationUnit)
  }

  /**
   * @inheritdoc
   */
  public shouldRotate() {
    const filename = this.getCurrentFilename()

    if (this.cachedFilename === filename) {
      return false
    }

    this.cachedFilename = filename

    // Non-existing file indicates that there may be pre-existing files to rotate
    return !existsSync(filename)
  }

  /**
   * @inheritdoc
   */
  protected compareFilenames(a: string, b: string) {
    return a.localeCompare(b)
  }

  /**
   * @inheritdoc
   */
  public rotate(maxFiles: number) {
    this.deleteSurplusFiles(maxFiles)
  }
}
