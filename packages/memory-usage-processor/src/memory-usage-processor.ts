import { LogRecord } from '@livy/contracts/lib/log-record'
import { ProcessorInterface } from '@livy/contracts/lib/processor-interface'

/**
 * Injects memory usage into record.extra
 */
export class MemoryUsageProcessor implements ProcessorInterface {
  protected humanReadable: boolean

  /**
   * @param humanReadable Whether human-readable memory information should be reported instead of the raw number of bytes
   */
  public constructor(humanReadable = true) {
    this.humanReadable = humanReadable
  }

  /**
   * Round a number to a particular precision
   *
   * @param value     The number to round
   * @param precision The number of decimals to round to
   */
  protected round(value: number, precision = 0) {
    if (precision === 0) {
      return Math.round(value)
    } else {
      const factor = 10 ** precision
      return Math.round(value * factor) / factor
    }
  }

  /**
   * Convert a number of bytes to a human-readable string
   *
   * @param raw The raw number of bytes
   */
  protected convertToHumanReadable(raw: number): string {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) {
      throw new Error(
        `Unexpected argument: Finite, non-negative number expected, received ${JSON.stringify(
          raw
        )}`
      )
    }

    let reduced = raw

    // Iterate over all units to find the most fitting one
    for (let i = 0; i < units.length; i++) {
      const isLargestUnit = i === units.length - 1

      // The number is considered human-readable if no larger unit
      // can be assigned to it (without the value dropping below 1)
      if (reduced < 1024 || isLargestUnit) {
        // Round to 1 decimal for values < 100, to 0 decimals otherwise
        // For example: 10.57 -> 10.6 but 100.57 -> 101
        let roundedValue =
          reduced < 100 ? this.round(reduced, 1) : this.round(reduced)

        // If the reduced value is lower than 1024 but the rounded value is 1024,
        // use the next larger unit if available
        if (roundedValue === 1024 && !isLargestUnit) {
          roundedValue = 1
          i++
        }

        return `${roundedValue} ${units[i]}`
      }

      reduced /= 1024
    }

    // istanbul ignore next: This should never happen with all safety checks put in before, but it is needed to appease TypeScript
    throw new Error(
      'Unexpected error when converting memory usage to human readable format'
    )
  }

  /**
   * @inheritdoc
   */
  public process(record: LogRecord) {
    const memoryUsage = process.memoryUsage().heapTotal

    record.extra.memory_usage = this.humanReadable
      ? this.convertToHumanReadable(memoryUsage)
      : memoryUsage

    return record
  }
}
