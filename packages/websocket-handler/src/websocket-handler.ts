import { ClosableHandlerInterface } from '@livy/contracts/lib/closable-handler-interface'
import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { JsonFormatter } from '@livy/json-formatter'
import {
  AbstractLevelBubbleHandler,
  AbstractLevelBubbleHandlerOptions
} from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import { FormattableHandlerMixin } from '@livy/util/lib/handlers/formattable-handler-mixin'
import { ProcessableHandlerMixin } from '@livy/util/lib/handlers/processable-handler-mixin'
import eio from 'engine.io-client'

export interface WebSocketHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * engine.io client connection options
   */
  connection: eio.SocketOptions

  /**
   * The formatter to use
   */
  formatter: FormatterInterface
}

/**
 * Sends log records to a WebSocket server
 */
export class WebSocketHandler
  extends FormattableHandlerMixin(
    ProcessableHandlerMixin(AbstractLevelBubbleHandler)
  )
  implements ClosableHandlerInterface {
  protected connection: Promise<eio.Socket> | undefined
  protected url: string
  protected connectionOptions: eio.SocketOptions

  public constructor(
    url: string,
    {
      connection = {},
      formatter,
      ...options
    }: Partial<WebSocketHandlerOptions> = {}
  ) {
    super(options)

    this.url = url
    this.connectionOptions = connection
    this.explicitFormatter = formatter
  }

  /**
   * Connect to the WebSocket
   */
  public async connect() {
    await this.makeConnection()
  }

  /**
   * Get a connection to the WebSocket
   */
  protected makeConnection() {
    if (this.connection) {
      return this.connection
    }

    this.connection = new Promise<eio.Socket>((resolve, reject) => {
      const socket = eio(this.url, {
        ...this.connectionOptions,
        transports: ['websocket']
      })
      socket.on('open', () => {
        resolve(socket)
      })
      socket.on('close', () => {
        this.connection = undefined
      })
      socket.on('error', (error: Error) => {
        reject(error)
      })
    })

    return this.connection
  }

  public close() {
    if (this.connection) {
      this.connection.then(socket => {
        socket.close()
      })
    }
  }

  /**
   * @inheritdoc
   */
  public get defaultFormatter(): FormatterInterface {
    return new JsonFormatter()
  }

  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    if (!this.isHandling(record.level)) {
      return
    }

    const connection = await this.makeConnection()
    connection.send(this.formatter.format(record))

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public async handleBatch(records: LogRecord[]) {
    if (!records.some(record => this.isHandling(record.level))) {
      return
    }

    const connection = await this.makeConnection()
    const formatter = this.formatter

    for (const record of records) {
      connection.send(formatter.format(record))
    }
  }
}
