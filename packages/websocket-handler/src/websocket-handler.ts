import type {
  ClosableHandlerInterface,
  FormatterInterface,
  LogRecord,
} from '@livy/contracts'
import { JsonFormatter } from '@livy/json-formatter'
import {
  AbstractLevelBubbleHandler,
  AbstractLevelBubbleHandlerOptions,
} from '@livy/util/handlers/abstract-level-bubble-handler'
import { FormattableHandlerMixin } from '@livy/util/handlers/formattable-handler-mixin'
import { ProcessableHandlerMixin } from '@livy/util/handlers/processable-handler-mixin'
import { Socket, SocketOptions } from 'engine.io-client'

export interface WebSocketHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * engine.io client connection options
   */
  connection: Partial<SocketOptions>

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
    ProcessableHandlerMixin(AbstractLevelBubbleHandler),
  )
  implements ClosableHandlerInterface
{
  protected connection: Promise<Socket> | undefined
  protected url: string
  protected connectionOptions: Partial<SocketOptions>

  public constructor(
    url: string,
    {
      connection = {},
      formatter,
      ...options
    }: Partial<WebSocketHandlerOptions> = {},
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

    this.connection = new Promise<Socket>((resolve, reject) => {
      const socket = new Socket(this.url, {
        ...this.connectionOptions,
        transports: ['websocket'],
      })
      socket.on('open', () => {
        resolve(socket)
      })
      socket.on('close', () => {
        this.connection = undefined
      })
      socket.on('error', error => {
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
  public getDefaultFormatter(): FormatterInterface {
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
