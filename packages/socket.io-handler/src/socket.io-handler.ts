import type { ClosableHandlerInterface, LogRecord } from '@livy/contracts'
import {
  AbstractLevelBubbleHandler,
  AbstractLevelBubbleHandlerOptions,
} from '@livy/util/handlers/abstract-level-bubble-handler'
import { ProcessableHandlerMixin } from '@livy/util/handlers/processable-handler-mixin'
import { Socket, SocketOptions, io } from 'socket.io-client'

export interface SocketIoHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * Socket.IO client connection options
   */
  connection: Partial<SocketOptions>
}

/**
 * Sends log records to a Socket.IO server
 *
 * @see https://socket.io
 */
export class SocketIoHandler
  extends ProcessableHandlerMixin(AbstractLevelBubbleHandler)
  implements ClosableHandlerInterface
{
  protected connection: Promise<Socket> | undefined
  protected url: string
  protected connectionOptions: Partial<SocketOptions>

  public constructor(
    url: string,
    { connection = {}, ...options }: Partial<SocketIoHandlerOptions> = {},
  ) {
    super(options)
    this.url = url
    this.connectionOptions = connection
  }

  /**
   * Connect to the Socket.IO server
   */
  public async connect() {
    await this.makeConnection()
  }

  /**
   * Get a connection to the Socket.IO server
   */
  protected makeConnection() {
    if (this.connection) {
      return this.connection
    }

    this.connection = new Promise<Socket>((resolve, reject) => {
      const socket = io(this.url, this.connectionOptions)
      socket.on('connect', () => {
        resolve(socket)
      })
      socket.on('disconnect', () => {
        this.connection = undefined
      })
      socket.on('connect_error', (error: Error) => {
        reject(error)
      })
    })

    return this.connection
  }

  /**
   * @inheritdoc
   */
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
  public async handle(record: LogRecord) {
    if (!this.isHandling(record.level)) {
      return
    }

    const connection = await this.makeConnection()
    connection.emit('log', record)

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

    for (const record of records) {
      connection.emit('log', record)
    }
  }
}
