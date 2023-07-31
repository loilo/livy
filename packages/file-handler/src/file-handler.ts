import * as fs from 'node:fs'
import { dirname } from 'node:path'
import type {
  ClosableHandlerInterface,
  FormatterInterface,
  LogRecord,
} from '@livy/contracts'
import { EOL } from '@livy/util/environment'
import { AbstractSyncFormattingProcessingHandler } from '@livy/util/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/handlers/abstract-level-bubble-handler'

export interface FileHandlerOptions extends AbstractLevelBubbleHandlerOptions {
  /**
   * The formatter to use
   */
  formatter: FormatterInterface

  /**
   * Prepend one or more lines to the file when it's first created
   * This can be useful to prepend header data, like in CSV
   */
  prefix: string | string[]

  /**
   * Write the file in append mode (i.e. don't erase previous contents)
   */
  append: boolean
}

/**
 * Writes log records to a file
 */
export class FileHandler
  extends AbstractSyncFormattingProcessingHandler
  implements ClosableHandlerInterface
{
  protected fileHandle?: number
  protected path: string
  protected append: boolean
  protected prefix: string[]

  public constructor(
    path: string,
    {
      formatter,
      prefix = [],
      append = true,
      ...options
    }: Partial<FileHandlerOptions> = {},
  ) {
    super(options)

    this.append = append
    this.prefix = typeof prefix === 'string' ? [prefix] : prefix
    this.explicitFormatter = formatter

    const directory = dirname(path)
    let stat
    try {
      stat = fs.statSync(directory)
    } catch (error) {
      throw new Error(
        `Provided log path directory "${directory}" does not exist: ${
          /* c8 ignore next: Unfortunately, code coverage somehow does not recognize this line as covered */
          error instanceof Error ? error.message : error
        }`,
      )
    }
    if (!stat.isDirectory()) {
      throw new Error(
        `Provided log path parent "${directory}" is not a directory`,
      )
    }

    this.path = path
  }

  /**
   * @inheritdoc
   */
  public close() {
    if (typeof this.fileHandle === 'number') {
      fs.closeSync(this.fileHandle)
      this.fileHandle = undefined
    }
  }

  /**
   * Get the prefix string to write
   */
  private get prefixString() {
    return this.prefix.map(line => `${line}${EOL}`).join('')
  }

  /**
   * Write the formatted record to the file
   */
  protected async write(_record: LogRecord, formatted: string) {
    // No handle to the target file exists yet
    if (typeof this.fileHandle !== 'number') {
      const needsPrefix = this.prefix.length > 0 && !fs.existsSync(this.path)

      // Get a handle to the file to write
      this.fileHandle = await new Promise((resolve, reject) => {
        fs.open(this.path, this.append ? 'a' : 'w', (error, handle) => {
          if (error) {
            reject(error)
          } else {
            resolve(handle)
          }
        })
      })

      // Write the prefix to the handle
      if (needsPrefix) {
        await new Promise((resolve, reject) => {
          fs.write(this.fileHandle!, this.prefixString, (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          })
        })
      }
    }

    await new Promise((resolve, reject) => {
      fs.write(this.fileHandle!, `${formatted}${EOL}`, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * Write the formatted record to the file
   */
  protected writeSync(_record: LogRecord, formatted: string) {
    if (typeof this.fileHandle !== 'number') {
      const needsPrefix = this.prefix.length > 0 && !fs.existsSync(this.path)

      this.fileHandle = fs.openSync(this.path, this.append ? 'a' : 'w')

      if (needsPrefix) {
        fs.writeSync(this.fileHandle, this.prefixString)
      }
    }

    fs.writeSync(this.fileHandle, `${formatted}${EOL}`)
  }
}
