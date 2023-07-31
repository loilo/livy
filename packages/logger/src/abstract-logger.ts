import type {
  HandlerInterface,
  LogLevel,
  LogRecord,
  ProcessorInterfaceOrFunction,
  SyncHandlerInterface,
} from '@livy/contracts'
import { logLevels, SeverityMap } from '@livy/contracts'
import * as environment from '@livy/util/environment'
import { isClosableHandlerInterface } from '@livy/util/handlers/is-closable-handler-interface'
import { getObviousTypeName, isPrimitive } from '@livy/util/helpers'
import { isResettableInterface } from '@livy/util/is-resettable-interface'
import { AnyObject } from '@livy/util/types'
import { ValidatableSet } from '@livy/util/validatable-set'
import * as luxon from 'luxon'

export interface LoggerOptions<
  HandlerType extends HandlerInterface | SyncHandlerInterface,
> {
  /**
   * Whether to automatically run the logger's `close` method when the Node.js process exits / the browser page closes
   */
  autoClose: boolean

  /**
   * Handlers of the logger
   */
  handlers: Iterable<HandlerType>

  /**
   * Processors of the logger
   */
  processors: Iterable<ProcessorInterfaceOrFunction>

  /**
   * The time zone the logger should use
   */
  timezone: string
}

/**
 * A base logger class with all functionalities common to sync, async and mixed loggers
 */
export abstract class AbstractLogger<
  HandlerType extends HandlerInterface | SyncHandlerInterface,
  HandlerResultType,
> {
  /**
   * A list of currently unclosed loggers which should be closed on exit
   */
  private static openLoggers: { close(): void }[] = []

  /**
   * The handler attached to the program exit event
   */
  private static exitHandler() {
    /* c8 ignore start: Unloading is hard to test */
    for (const logger of AbstractLogger.openLoggers) {
      logger.close()
    }
    /* c8 ignore stop */
  }

  /**
   * Clear registered exit handlers
   * This is mostly useful for unit testing
   */
  public static clearExitHandlers() {
    /* c8 ignore start: Unloading is hard to test */
    if (AbstractLogger.openLoggers.length > 0) {
      AbstractLogger.openLoggers.splice(0)

      if (environment.isNodeJs) {
        process.removeListener('exit', AbstractLogger.exitHandler)
      } else if (environment.isBrowser) {
        self.removeEventListener('unload', AbstractLogger.exitHandler)
      }
    }
    /* c8 ignore stop */
  }

  /**
   * The handlers attached to the logger
   */
  protected _handlers: ValidatableSet<HandlerType>

  /**
   * The processors attached to the logger
   */
  protected _processors: Set<ProcessorInterfaceOrFunction>

  /**
   * Timezone applied to record datetimes
   */
  protected _timezone!: string

  public constructor(
    private _name: string,
    {
      autoClose = true,
      handlers = [],
      processors = [],
      timezone = typeof luxon.Settings.defaultZone === 'string'
        ? luxon.Settings.defaultZone
        : luxon.Settings.defaultZone.name,
    }: Partial<LoggerOptions<HandlerType>> = {},
  ) {
    this._handlers = new ValidatableSet(handlers)
    this._processors = new Set(processors)
    this.timezone = timezone

    if (autoClose) {
      this.closeOnExit()
    }
  }

  /**
   * Get the logger's channel name
   */
  public get name(): string {
    return this._name
  }

  /**
   * Clone the logger with a new name
   *
   * @param name The new instance's logger name
   */
  public abstract withName(
    name: string,
  ): AbstractLogger<HandlerType, HandlerResultType>

  /**
   * Get the logger's timezone
   */
  public get timezone() {
    return this._timezone
  }

  /**
   * Set the logger's timezone
   */
  public set timezone(value: string) {
    // This throws an error if the timezone is invalid
    if (!luxon.IANAZone.isValidZone(value)) {
      throw new Error(`Invalid timezone "${value}"`)
    }

    this._timezone = value
  }

  /**
   * Get the handlers attached to the logger
   */
  public get handlers() {
    return this._handlers
  }

  /**
   * Get the processors attached to the logger
   */
  public get processors() {
    return this._processors
  }

  /**
   * Close when the program terminates
   */
  private closeOnExit() {
    if (AbstractLogger.openLoggers.length === 0) {
      /* c8 ignore start: Simulating browser unloading is too hard to test */
      if (environment.isNodeJs) {
        process.on('exit', AbstractLogger.exitHandler)
      } else if (environment.isBrowser) {
        self.addEventListener('unload', AbstractLogger.exitHandler)
      }
      /* c8 ignore stop */
    }

    AbstractLogger.openLoggers.push(this)
  }

  /**
   * Close all registered handlers
   */
  public close() {
    for (const handler of this._handlers) {
      if (isClosableHandlerInterface(handler)) {
        handler.close()
      }
    }
  }

  /**
   * Reset all registered handlers and processors
   */
  public reset() {
    for (const handler of this._handlers) {
      if (isResettableInterface(handler)) {
        handler.reset()
      }
    }

    for (const processor of this._processors) {
      if (isResettableInterface(processor)) {
        processor.reset()
      }
    }
  }

  /**
   * Checks whether the logger has a handler that listens on the given level
   */
  public isHandling(level: LogLevel) {
    return (
      this._handlers.size > 0 &&
      [...this._handlers].some(handler => handler.isHandling(level))
    )
  }

  /**
   * Run registered handlers on a log record
   *
   * @param record The record to provide to the handlers
   */
  protected abstract runHandlers(
    record: LogRecord,
    offset?: number,
  ): HandlerResultType

  /**
   * @inheritdoc
   */
  public log(level: LogLevel, message: string, context: AnyObject = {}) {
    if (!logLevels.includes(level)) {
      throw new Error(
        `Invalid log level "${level}", use one of: ${logLevels.join(', ')}`,
      )
    }

    if (!isPrimitive(message)) {
      throw new Error(
        `Log message must be a primitive, ${getObviousTypeName(message)} given`,
      )
    }

    let record: LogRecord = {
      level,
      severity: SeverityMap[level],
      message: String(message),
      context,
      extra: {},
      datetime: luxon.DateTime.local().setZone(this._timezone),
      channel: this._name,
    }

    // Apply global processors
    for (const processor of this._processors) {
      if (typeof processor === 'function') {
        record = processor(record)
      } else {
        record = processor.process(record)
      }
    }

    return this.runHandlers(record)
  }

  /**
   * @inheritdoc
   */
  public emergency(message: string, context: AnyObject = {}) {
    return this.log('emergency', message, context)
  }

  /**
   * @inheritdoc
   */
  public alert(message: string, context: AnyObject = {}) {
    return this.log('alert', message, context)
  }

  /**
   * @inheritdoc
   */
  public critical(message: string, context: AnyObject = {}) {
    return this.log('critical', message, context)
  }

  /**
   * @inheritdoc
   */
  public error(message: string, context: AnyObject = {}) {
    return this.log('error', message, context)
  }

  /**
   * @inheritdoc
   */
  public warning(message: string, context: AnyObject = {}) {
    return this.log('warning', message, context)
  }

  /**
   * @inheritdoc
   */
  public notice(message: string, context: AnyObject = {}) {
    return this.log('notice', message, context)
  }

  /**
   * @inheritdoc
   */
  public info(message: string, context: AnyObject = {}) {
    return this.log('info', message, context)
  }

  /**
   * @inheritdoc
   */
  public debug(message: string, context: AnyObject = {}) {
    return this.log('debug', message, context)
  }
}
