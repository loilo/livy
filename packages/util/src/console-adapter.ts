import { LoggerInterface } from '@livy/contracts/lib/logger-interface'
import { ConsoleAdapterInterface } from './console-adapter-interface'
import { fromEntries } from './helpers'
import { Timer, TimerInterface } from './timer'
import { AnyObject } from './types'

/**
 * @inheritdoc
 */
export class ConsoleAdapter implements ConsoleAdapterInterface {
  protected counters: AnyObject<number> = {}
  protected timers: AnyObject<TimerInterface> = {}
  protected indentation = 0
  protected logger: LoggerInterface

  public constructor(logger: LoggerInterface) {
    this.logger = logger
  }

  protected get indentationString() {
    return '  '.repeat(this.indentation)
  }

  /**
   * @inheritdoc
   */
  public count(label?: string) {
    if (typeof label === 'undefined') {
      label = 'default'
    }

    this.counters[label] = (this.counters[label] || 0) + 1
    this.logger.debug(`${this.indentationString}console.count`, {
      label,
      count: this.counters[label]
    })
  }

  /**
   * @inheritdoc
   */
  public countReset(label?: string) {
    if (typeof label === 'undefined') {
      label = 'default'
    }

    delete this.counters[label]
  }

  /**
   * @inheritdoc
   */
  public debug(message?: any, ...optionalParameters: any[]) {
    this.logger.debug(`${this.indentationString}console.debug`, {
      parameters: [message, ...optionalParameters]
    })
  }

  /**
   * @inheritdoc
   */
  public dir(object: any) {
    this.logger.debug(`${this.indentationString}console.dir`, { dir: object })
  }

  /**
   * @inheritdoc
   */
  public dirxml(...data: any[]) {
    this.logger.debug(`${this.indentationString}console.dirxml`, {
      objects: data
    })
  }

  /**
   * @inheritdoc
   */
  public error(message?: any, ...optionalParameters: any[]) {
    this.logger.error(`${this.indentationString}console.error`, {
      parameters: [message, ...optionalParameters]
    })
  }

  /**
   * @inheritdoc
   */
  public group(label?: any) {
    this.logger.debug(`${this.indentationString}console.group`, { label })
    this.indentation++
  }

  /**
   * The `console.groupCollapsed()` function is an alias for `console.group()`
   */
  public groupCollapsed(label?: any) {
    this.logger.debug(`${this.indentationString}console.groupCollapsed`, {
      label
    })
    this.indentation++
  }

  /**
   * @inheritdoc
   */
  public groupEnd() {
    if (this.indentation > 0) {
      this.indentation--
    }

    this.logger.debug(`${this.indentationString}console.groupEnd`)
  }

  /**
   * @inheritdoc
   */
  public info(message?: any, ...optionalParameters: any[]) {
    this.logger.info(`${this.indentationString}console.info`, {
      parameters: [message, ...optionalParameters]
    })
  }

  /**
   * @inheritdoc
   */
  public log(message?: any, ...optionalParameters: any[]) {
    this.logger.debug(`${this.indentationString}console.log`, {
      parameters: [message, ...optionalParameters]
    })
  }

  /**
   * @inheritdoc
   */
  public table(tabularData: any, properties?: string | string[]) {
    try {
      if (Array.isArray(tabularData) && typeof properties !== 'undefined') {
        const propertiesArray = Array.isArray(properties)
          ? properties
          : [properties]

        tabularData = tabularData.map(entry => {
          return fromEntries(
            Object.entries(entry).filter(([property]) =>
              propertiesArray.includes(property)
            )
          )
        })
      }
    } catch {
      // Ignore invalid data
    }

    this.logger.debug(`${this.indentationString}console.table`, {
      data: tabularData
    })
  }

  /**
   * @inheritdoc
   */
  public time(label?: string) {
    if (typeof label === 'undefined') {
      label = 'default'
    }

    this.timers[label] = this.timers[label] || new Timer()

    if (this.timers[label].running()) {
      return
    }

    this.timers[label].start()
  }

  /**
   * @inheritdoc
   */
  public timeEnd(label?: string) {
    if (typeof label === 'undefined') {
      label = 'default'
    }

    const elapsed = label in this.timers ? this.timers[label].reset() : null

    this.logger.debug(`${this.indentationString}console.timeEnd`, {
      label,
      elapsed
    })

    delete this.timers[label]
  }

  /**
   * @inheritdoc
   */
  public timeLog(label?: string, ...data: any[]) {
    if (typeof label === 'undefined') {
      label = 'default'
    }

    const elapsed = label in this.timers ? this.timers[label].get() : null

    this.logger.debug(`${this.indentationString}console.timeLog`, {
      label,
      elapsed,
      data
    })
  }

  /**
   * @inheritdoc
   */
  public trace(...data: any[]) {
    this.logger.debug(`${this.indentationString}console.trace`, {
      trace: new Error().stack,
      data
    })
  }

  /**
   * @inheritdoc
   */
  public warn(message?: any, ...optionalParameters: any[]) {
    this.logger.warning(`${this.indentationString}console.warn`, {
      parameters: [message, ...optionalParameters]
    })
  }
}
