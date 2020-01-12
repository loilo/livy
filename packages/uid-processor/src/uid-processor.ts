import { LogRecord } from '@livy/contracts/lib/log-record'
import { ProcessorInterface } from '@livy/contracts/lib/processor-interface'
import { ResettableInterface } from '@livy/contracts/lib/resettable-interface'
import * as environment from '@livy/util/lib/environment'

/**
 * Adds a unique identifier to record.extra
 */
export class UidProcessor implements ProcessorInterface, ResettableInterface {
  private _uid: string

  /**
   * @param length The length of the UID (in bytes, the actual UID will be a hex string of double that length)
   */
  public constructor(private length = 7) {
    if (!Number.isInteger(length) || length < 1) {
      throw new Error(
        `Invalid UID length ${JSON.stringify(
          length
        )}: must be a positive integer`
      )
    }

    this._uid = this.generateUid(length)
  }

  /**
   * @inheritdoc
   */
  public process(record: LogRecord) {
    record.extra.uid = this._uid
    return record
  }

  /**
   * Get the generated UID
   */
  public get uid(): string {
    return this._uid
  }

  /**
   * @inheritdoc
   */
  public reset() {
    this._uid = this.generateUid(this._uid.length / 2)
  }

  /**
   * Generate a new UID
   *
   * @param length The length of the UID (in bytes)
   */
  private generateUid(length: number): string {
    // istanbul ignore if: JSDOM does not include fallbacks for crypto
    if (environment.isBrowser) {
      const bytes = new Uint8Array(length)
      crypto.getRandomValues(bytes)
      return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
    } else if (environment.isNodeJs) {
      return require('crypto')
        .randomBytes(length)
        .toString('hex')
    } else {
      // istanbul ignore next: Not testing other environments
      throw new Error('Cannot create a UID in your environment')
    }
  }
}
