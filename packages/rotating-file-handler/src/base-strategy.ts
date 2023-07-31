import { existsSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { MaxAgeStrategyOptions } from './max-age-strategy.js'
import { MaxSizeStrategyOptions } from './max-size-strategy.js'
import { RotationStrategyInterface } from './rotation-strategy.js'

/**
 * Common functionality for all `RotatingFileHandler` strategies
 */
export abstract class BaseStrategy<
  T extends MaxAgeStrategyOptions | MaxSizeStrategyOptions,
> implements RotationStrategyInterface
{
  constructor(
    protected directory: string,
    protected filenameTemplate: string,
    protected threshold: T['threshold'],
  ) {
    if (!existsSync(directory)) {
      throw new Error(
        `Directory for rotating log files "${directory}" does not exist`,
      )
    }
  }

  /**
   * @inheritdoc
   */
  public abstract getCurrentFilename(): string

  /**
   * @inheritdoc
   */
  public abstract shouldRotate(): boolean

  /**
   * @inheritdoc
   */
  public abstract rotate(maxFiles: number): void

  /**
   * Compare (as in a custom sort callback) two filenames so that the older one goes first and the more recent one goes after
   * This is used to sort existing log files and delete the older ones
   *
   * @param a
   * @param b
   */
  protected abstract compareFilenames(a: string, b: string): number

  /**
   * Get a regular expression that matches log files generated by this strategy
   */
  protected abstract getFilenameRegex(): RegExp

  /**
   * Get a list of existing log files, sorted by recency
   */
  protected getExistingFiles() {
    const regex = this.getFilenameRegex()

    return readdirSync(this.directory)
      .filter(
        file => regex.test(file) && statSync(join(this.directory, file)).isFile,
      )
      .sort(this.compareFilenames.bind(this))
  }

  /**
   * Delete files that are no longer needed according to `maxFiles`
   *
   * @param maxFiles The number of log files to keep
   */
  protected deleteSurplusFiles(maxFiles: number) {
    const files = this.getExistingFiles()

    // If the current file name is *not* among the existing ones, we decrement
    // the number of allowed files since probably there will be
    // a new file created with the next logging entry
    if (!files.includes(this.getCurrentFilename())) {
      maxFiles--
    }

    let filesToDelete: string[]
    if (maxFiles === 0) {
      filesToDelete = files
    } else {
      filesToDelete = files.slice(0, -maxFiles)
    }

    for (const file of filesToDelete) {
      unlinkSync(join(this.directory, file))
    }
  }
}
