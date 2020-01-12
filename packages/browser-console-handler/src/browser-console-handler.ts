import { SyncHandlerInterface } from '@livy/contracts/lib/handler-interface'
import { LogLevel, SeverityMap } from '@livy/contracts/lib/log-level'
import { LogRecord } from '@livy/contracts/lib/log-record'
import {
  AbstractLevelBubbleHandler,
  AbstractLevelBubbleHandlerOptions
} from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import { MirrorSyncHandlerMixin } from '@livy/util/lib/handlers/mirror-sync-handler-mixin'
import { ProcessableHandlerMixin } from '@livy/util/lib/handlers/processable-handler-mixin'
import { isEmpty } from '@livy/util/lib/helpers'
import { DateTime } from 'luxon'

export interface BrowserConsoleHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * Whether to use the browser's built-in console.debug() for the "debug" level,
   * which is only visible in the dev tools when explicitly configured so
   */
  useNativeDebug: boolean

  /**
   * Whether to include timestamps in the output
   */
  timestamps: boolean

  /**
   * The Console object to use
   */
  console: Console
}

/**
 * Writes log records to a browser console
 */
export class BrowserConsoleHandler
  extends MirrorSyncHandlerMixin(
    ProcessableHandlerMixin(AbstractLevelBubbleHandler)
  )
  implements SyncHandlerInterface {
  private useNativeDebug: boolean
  private timestamps: boolean
  private console: Console

  public constructor({
    useNativeDebug = false,
    timestamps = false,
    console = self.console,
    ...options
  }: Partial<BrowserConsoleHandlerOptions> = {}) {
    super(options)

    this.console = console
    this.timestamps = timestamps
    this.useNativeDebug = useNativeDebug
  }

  /**
   * @inheritdoc
   */
  protected formatDatetime(datetime: DateTime) {
    return ['color: #888', datetime.toFormat('HH:mm:ss.SSS')]
  }

  /**
   * @inheritdoc
   */
  protected formatLevel(level: LogLevel) {
    const formatted = level.toUpperCase()

    let color: string
    switch (level) {
      case 'emergency':
        color = 'background-color: #f43a63; padding: 0 0.4em; color: #fff'
        break

      case 'alert':
        color = 'background-color: #f43a63; padding: 0 0.4em; color: #fff'
        break

      case 'critical':
        color = 'color: #f43a63'
        break

      case 'error':
        color = 'color: #f43a63'
        break

      case 'warning':
        color = 'color: #ffaa2b'
        break

      case 'notice':
        color = 'color: rgb(60, 161, 224)'
        break

      case 'info':
        color = 'color: rgb(60, 161, 224)'
        break

      case 'debug':
      default:
        color = 'color: rgba(60, 161, 224, 0.7)'
        break
    }

    return [color, formatted]
  }

  /**
   * @inheritdoc
   */
  public handleSync(record: LogRecord) {
    if (!this.isHandling(record.level)) {
      return
    }

    const resetter = 'color: inherit; background-color: inherit'
    const parameters: any[] = [record.message]
    const hasExtra = !isEmpty(record.extra)

    if (hasExtra || !isEmpty(record.context)) {
      parameters.push(record.context)
    }

    if (hasExtra) {
      parameters.push(record.extra)
    }

    const formattedTimestamp = this.timestamps
      ? this.formatDatetime(record.datetime).concat(resetter)
      : []
    const formattedLevel = this.formatLevel(record.level).concat(resetter)

    let placeholders = ['%c%s']
    if (this.timestamps) {
      placeholders.push('%c%s')
    }

    placeholders = placeholders.map(placeholder => `${placeholder}%c`)

    if (record.severity <= SeverityMap.error) {
      this.console.error(
        placeholders.join(' '),
        ...formattedTimestamp,
        ...formattedLevel,
        ...parameters
      )
    } else if (record.severity === SeverityMap.warning) {
      this.console.warn(
        placeholders.join(' '),
        ...formattedTimestamp,
        ...formattedLevel,
        ...parameters
      )
    } else if (record.severity <= SeverityMap.info) {
      this.console.info(
        placeholders.join(' '),
        ...formattedTimestamp,
        ...formattedLevel,
        ...parameters
      )
    } else {
      if (this.useNativeDebug) {
        placeholders.pop()

        this.console.debug(
          placeholders.join(' '),
          ...formattedTimestamp,
          ...parameters
        )
      } else {
        this.console.log(
          placeholders.join(' '),
          ...formattedTimestamp,
          ...formattedLevel,
          ...parameters
        )
      }
    }

    return !this.bubble
  }
}
