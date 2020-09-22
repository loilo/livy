import { ClosableHandlerInterface } from '@livy/contracts/lib/closable-handler-interface'
import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { ResettableInterface } from '@livy/contracts/lib/resettable-interface'
import { HtmlPrettyFormatter } from '@livy/html-pretty-formatter'
import { AbstractSyncFormattingProcessingHandler } from '@livy/util/lib/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import { isPromiseLike } from '@livy/util/lib/helpers'
import { Promisable } from '@livy/util/lib/types'

export type AutoScroll = 'edge' | 'force' | 'none'

export interface DomHandlerOptions extends AbstractLevelBubbleHandlerOptions {
  /**
   * Scroll behavior when new entries are inserted:
   * - edge: scroll new entry into view if container has previously been scrolled to the edge
   * - force: always scroll new entries into view
   * - none: no automatic scrolling
   */
  autoScroll: AutoScroll

  /**
   * The formatter to use
   */
  formatter: FormatterInterface

  /**
   * Whether DOM elements should be added at the beginning of the container instead of the end
   */
  reversed: boolean
}

/**
 * Writes log records to the browser DOM
 */
export class DomHandler
  extends AbstractSyncFormattingProcessingHandler
  implements ResettableInterface, ClosableHandlerInterface {
  public reversed: boolean
  public autoScroll: AutoScroll
  private readyHandler?: () => void

  /**
   * The DOM element to attach log entries to
   */
  protected container: Promisable<Element>

  public constructor(
    container: string | Element,
    {
      reversed = false,
      autoScroll = 'edge',
      formatter,
      ...options
    }: Partial<DomHandlerOptions> = {}
  ) {
    super(options)

    this.autoScroll = autoScroll
    this.reversed = reversed
    this.explicitFormatter = formatter

    if (typeof container === 'string') {
      const possibleContainer = document.querySelector(container)
      if (possibleContainer) {
        this.container = possibleContainer
      } else {
        this.container = this.watchDomReadyState().then(() => {
          const queriedContainerElement = document.querySelector(container)

          if (queriedContainerElement === null) {
            throw new Error(
              `Could not find DomHandler target element at selector "${container}"`
            )
          }

          this.container = queriedContainerElement

          return queriedContainerElement
        })
      }
    } else {
      this.container = container
    }
  }

  /**
   * @inheritdoc
   */
  public getDefaultFormatter(): FormatterInterface {
    return new HtmlPrettyFormatter()
  }

  /**
   * Get a promise that resolves when the DOM is ready
   */
  private watchDomReadyState(): Promise<void> {
    if (document.readyState === 'loading') {
      return new Promise(resolve => {
        this.readyHandler = () => {
          if (document.readyState !== 'loading') {
            document.removeEventListener('DOMContentLoaded', this.readyHandler!)
            this.readyHandler = undefined
            resolve()
          }
        }

        document.addEventListener('DOMContentLoaded', this.readyHandler)
      })
    } else {
      // istanbul ignore next: This ist just a fallback that should usually not occur in practice
      return Promise.resolve()
    }
  }

  /**
   * Perform synchronous or asynchrounus writing
   *
   * @param formatted The formatted string to write
   * @param container The container element the formatted entries go to
   */
  private doWrite(formatted: string, container: Element) {
    let isAtEdge = false

    // istanbul ignore next: Scrolling cannot be tested with the JSDOM mock
    if (this.autoScroll === 'force') {
      isAtEdge = true
    } else if (this.autoScroll === 'edge') {
      isAtEdge = this.reversed
        ? container.scrollTop === 0
        : container.scrollTop ===
          container.scrollHeight - container.clientHeight
    }

    container.insertAdjacentHTML(
      this.reversed ? 'afterbegin' : 'beforeend',
      formatted
    )

    // istanbul ignore next: Scrolling cannot be tested with the JSDOM mock
    if (isAtEdge) {
      container.scrollTop = this.reversed
        ? 0
        : container.scrollHeight - container.clientHeight
    }
  }

  /**
   * @inheritdoc
   */
  protected async write(_record: LogRecord, formatted: string) {
    const container = await this.container
    return this.doWrite(formatted, container)
  }

  /**
   * @inheritdoc
   */
  protected writeSync(_record: LogRecord, formatted: string) {
    const container = this.container

    if (isPromiseLike(container)) {
      throw new Error(`Could not find DomHandler target element`)
    }

    return this.doWrite(formatted, container)
  }

  /**
   * @inheritdoc
   */
  public reset() {
    if (this.container instanceof Element) {
      this.container.innerHTML = ''
    }
  }

  /**
   * @inheritdoc
   */
  public close() {
    if (this.readyHandler) {
      document.removeEventListener('DOMContentLoaded', this.readyHandler)
      this.readyHandler = undefined
    }
  }
}
