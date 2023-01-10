import { LogRecord } from '@livy/contracts/lib/log-record'
import {
  AbstractLevelBubbleHandler,
  AbstractLevelBubbleHandlerOptions
} from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import { ProcessableHandlerMixin } from '@livy/util/lib/handlers/processable-handler-mixin'
import got, { Options as GotOptions } from 'got'

type MaybeArray<T> = T | T[]
type Created<T, U extends any[] = []> = (...args: U) => T
type Creatable<T, U extends any[] = []> = T | Created<T, U>

interface HttpHandlerOptions<AllowBatchRequests extends boolean>
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * Whether batch handling should send all pending records as an array in one request
   */
  allowBatchRequests: AllowBatchRequests

  /**
   * Options to pass to each `got` call
   */
  requestOptions: Creatable<
    GotOptions,
    AllowBatchRequests extends true ? [MaybeArray<LogRecord>] : [LogRecord]
  >

  /**
   * Whether HTTP requests in batch handling must be executed sequentially instead of in parallel
   * Has no effect if `allowBatchRequests` is enabled
   */
  sequential: boolean
}

type HttpHandlerUrl<AllowBatchRequests extends boolean> = Creatable<
  'string' | GotOptions,
  AllowBatchRequests extends true ? [MaybeArray<LogRecord>] : [LogRecord]
>
type HttpHandlerUrlGenerator<AllowBatchRequests extends boolean> = Created<
  'string' | GotOptions,
  AllowBatchRequests extends true ? [MaybeArray<LogRecord>] : [LogRecord]
>
type HttpHandlerGotOptionsGenerator<AllowBatchRequests extends boolean> =
  Created<
    GotOptions,
    AllowBatchRequests extends true ? [MaybeArray<LogRecord>] : [LogRecord]
  >

/**
 * Sends log records to an HTTP endpoint
 */
export class HttpHandler<
  AllowBatchRequests extends boolean
> extends ProcessableHandlerMixin(AbstractLevelBubbleHandler) {
  private url: HttpHandlerUrlGenerator<AllowBatchRequests>
  private requestOptions: HttpHandlerGotOptionsGenerator<AllowBatchRequests>
  private sequential: boolean
  private allowBatchRequests: AllowBatchRequests

  /**
   *
   * @param url     The URL to send the records to, or a callback which generates the URL from records
   * @param options
   */
  public constructor(
    url: HttpHandlerUrl<AllowBatchRequests>,
    {
      requestOptions = {},
      sequential = false,
      allowBatchRequests = false as AllowBatchRequests,
      ...options
    }: Partial<HttpHandlerOptions<AllowBatchRequests>> = {}
  ) {
    super(options)

    this.sequential = sequential
    this.allowBatchRequests = allowBatchRequests

    if (typeof url === 'function') {
      this.url = url
    } else {
      this.url = () => url
    }

    if (typeof requestOptions === 'function') {
      this.requestOptions = requestOptions
    } else {
      this.requestOptions = () => requestOptions
    }
  }

  public async handle(record: LogRecord) {
    if (!this.isHandling(record.level)) {
      return
    }

    // @ts-ignore
    // TypeScript does not recognize the records as correct arguments
    await got(this.url(record), this.requestOptions(record))

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public async handleBatch(records: LogRecord[]) {
    if (this.allowBatchRequests) {
      const filteredRecords = records.filter(record =>
        this.isHandling(record.level)
      )

      // @ts-ignore
      // TypeScript does not recognize the records as correct arguments
      await got(this.url(filteredRecords), this.requestOptions(filteredRecords))
    } else if (this.sequential) {
      for (const record of records) {
        await this.handle(record)
      }
    } else {
      await Promise.all(records.map(record => this.handle(record)))
    }
  }
}
