/**
 * The common structure of a rotation strategy
 */
export interface RotationStrategyInterface {
  /**
   * Get the current filename the handler wishes to write to
   */
  getCurrentFilename(): string

  /**
   * Check whether existing log files should be rotated
   */
  shouldRotate(): boolean

  /**
   * Perform the actual rotation
   *
   * @param maxFiles The number of files to keep
   */
  rotate(maxFiles: number): void
}
