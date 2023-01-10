import {
  HandlerInterface,
  SyncHandlerInterface
} from '@livy/contracts/lib/handler-interface'
import { LogLevel, SeverityMap } from '@livy/contracts/lib/log-level'
import { ResettableInterface } from '@livy/contracts/lib/resettable-interface'
import { FilterHandler } from '@livy/filter-handler'

export interface LevelFilterHandlerOptions {
  /**
   * The minimum activation level for the wrapped handler
   */
  minLevel: LogLevel

  /**
   * The maximum activation level for the wrapped handler
   */
  maxLevel: LogLevel

  /**
   * Whether this handler allows bubbling of records
   */
  bubble: boolean
}

/**
 * Simple handler wrapper that filters records based on a lower/upper level bound
 */
export class LevelFilterHandler
  extends FilterHandler
  implements SyncHandlerInterface, ResettableInterface
{
  /**
   * Filtered handler
   */
  protected handler: HandlerInterface

  /**
   * Minimum level for logs that are passed to handler
   */
  protected acceptedLevels: LogLevel[] = []

  public constructor(
    handler: HandlerInterface,
    {
      minLevel = 'debug',
      maxLevel = 'emergency',
      ...options
    }: Partial<LevelFilterHandlerOptions> = {}
  ) {
    super(handler, record => this.isHandling(record.level), options)

    this.handler = handler
    this.setAcceptedLevels(minLevel, maxLevel)
  }

  /**
   * Get accepted log levels
   */
  public getAcceptedLevels() {
    return this.acceptedLevels
  }

  /**
   * @param minLevel Minimum level to accept
   * @param maxLevel Maximum level to accept
   */
  public setAcceptedLevels(
    minLevel: LogLevel = 'debug',
    maxLevel: LogLevel = 'emergency'
  ) {
    this.acceptedLevels = Object.entries(SeverityMap)
      .filter(
        ([, severity]) =>
          severity <= SeverityMap[minLevel] && severity >= SeverityMap[maxLevel]
      )
      .map(([level]) => level as LogLevel)
  }

  /**
   * @inheritdoc
   */
  public isHandling(level: LogLevel) {
    return this.acceptedLevels.includes(level)
  }
}
