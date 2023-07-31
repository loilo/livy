import type {
  LogRecord,
  ProcessorInterface,
  ResettableInterface,
} from '@livy/contracts'
import { crypto } from './crypto.js'

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
          length,
        )}: must be a positive integer`,
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
    if (typeof crypto === 'object') {
      const bytes = new Uint8Array(length)
      crypto.getRandomValues(bytes)
      return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
    } else {
      /* c8 ignore next 2: Not testing other environments */
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error('Cannot create a UID in your environment')
    }
  }
}
