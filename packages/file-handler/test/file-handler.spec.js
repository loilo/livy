import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
  vi
} from 'vitest'
import * as fs from 'node:fs'
import { FileHandler } from '../src/file-handler'

const { record } = livyTestGlobals

describe('@livy/file-handler', () => {
  afterEach(() => {
    fs.__reset()
  })

  it('should write logs to the configured file', () => {
    const handler = new FileHandler('/logfile.txt')

    handler.handleSync(record('debug', 'Test FileHandler'))
    handler.handleSync(record('info', 'Test FileHandler'))
    handler.handleSync(record('notice', 'Test FileHandler'))
    handler.handleSync(record('warning', 'Test FileHandler'))
    handler.handleSync(record('error', 'Test FileHandler'))
    handler.handleSync(record('critical', 'Test FileHandler'))
    handler.handleSync(record('alert', 'Test FileHandler'))
    handler.handleSync(record('emergency', 'Test FileHandler'))

    expect(fs.toJSON()['/logfile.txt']).toMatchSnapshot()
  })

  it('should write logs to the configured file (async)', async () => {
    const handler = new FileHandler('/logfile.txt')

    await handler.handle(record('debug', 'Test FileHandler'))
    await handler.handle(record('info', 'Test FileHandler'))
    await handler.handle(record('notice', 'Test FileHandler'))
    await handler.handle(record('warning', 'Test FileHandler'))
    await handler.handle(record('error', 'Test FileHandler'))
    await handler.handle(record('critical', 'Test FileHandler'))
    await handler.handle(record('alert', 'Test FileHandler'))
    await handler.handle(record('emergency', 'Test FileHandler'))

    expect(fs.toJSON()['/logfile.txt']).toMatchSnapshot()
  })

  it('should fail when trying to write to a non-existing parent folder', () => {
    expect(() => new FileHandler('/foo/logfile.txt')).toThrow(
      /^Provided log path directory "\/foo" does not exist: /
    )
  })

  it('should fail when trying to write to an existing non-folder', () => {
    expect(() => {
      fs.writeFileSync('/foo', '')
      new FileHandler('/foo/logfile.txt')
    }).toThrowError(
      new Error(`Provided log path parent "/foo" is not a directory`)
    )
  })

  describe('needs a mock on fs.closeSync()', () => {
    let originalCloseSync
    beforeAll(() => {
      originalCloseSync = fs.closeSync
    })

    beforeEach(() => {
      fs.closeSync = vi.fn()
    })

    afterAll(() => {
      fs.closeSync = originalCloseSync
    })

    it('should close the open file handle if "close" is invoked', () => {
      const handler = new FileHandler('/logfile.txt')

      // Handle a record to open a file handle
      handler.handleSync(record('debug', 'Test FileHandler'))

      handler.close()

      expect(fs.closeSync).toHaveBeenCalledTimes(1)
      expect(fs.closeSync).toHaveBeenLastCalledWith(expect.any(Number))
    })

    it('should not attempt to close a file if none is opened', () => {
      const handler = new FileHandler('/logfile.txt')

      handler.close()

      expect(fs.closeSync).not.toHaveBeenCalled()
    })
  })

  describe('needs a mock on fs.write()', () => {
    let originalWrite

    beforeAll(() => {
      originalWrite = fs.write
    })

    beforeEach(() => {
      fs.write = vi.fn((_target, _content, callback) =>
        callback(new Error(`Mock write error`))
      )
    })

    afterAll(() => {
      fs.write = originalWrite
    })

    it('should fail trying write the prefix when fs.write() fails', async () => {
      const handler = new FileHandler('/logfile.txt', {
        prefix: ['prefix line']
      })

      let writeError
      try {
        await handler.handle(record('debug', 'Test FileHandler'))
      } catch (error) {
        writeError = error
      }

      expect(writeError).toEqual(new Error(`Mock write error`))
    })

    it('should fail trying write the log record when fs.write() fails', async () => {
      const handler = new FileHandler('/logfile.txt')

      let writeError
      try {
        await handler.handle(record('debug', 'Test FileHandler'))
      } catch (error) {
        writeError = error
      }

      expect(writeError).toEqual(new Error(`Mock write error`))
    })
  })

  it('should fail when trying to write to directory instead of file', () => {
    fs.writeFileSync('/logfile.txt', '')
    const handler = new FileHandler('/logfile.txt')
    fs.unlinkSync('/logfile.txt')
    fs.mkdirSync('/logfile.txt')

    expect(() => {
      handler.handleSync(record('debug', 'Test FileHandler'))
    }).toThrow(
      new Error(`EISDIR: illegal operation on a directory, open '/logfile.txt'`)
    )
  })

  it('should fail when trying to write to directory instead of file (async)', async () => {
    fs.writeFileSync('/logfile.txt', '')
    const handler = new FileHandler('/logfile.txt')
    fs.unlinkSync('/logfile.txt')
    fs.mkdirSync('/logfile.txt')

    let writeError
    try {
      await handler.handle(record('debug', 'Test FileHandler'))
    } catch (error) {
      writeError = error
    }

    expect(writeError).toEqual(
      new Error(`EISDIR: illegal operation on a directory, open '/logfile.txt'`)
    )
  })

  it('should append to existing log file', () => {
    fs.writeFileSync('/logfile.txt', 'pre-existing content\n')

    const handler = new FileHandler('/logfile.txt')

    handler.handleSync(record('debug', 'Test FileHandler'))

    const virtualLogfileContents = fs.toJSON()['/logfile.txt']
    expect(virtualLogfileContents).toMatch(/^pre-existing content/)
    expect(virtualLogfileContents).toMatchSnapshot()
  })

  it('should rewrite file if the "append" option is set to false', () => {
    fs.writeFileSync('/logfile.txt', 'pre-existing content\n')

    const handler = new FileHandler('/logfile.txt', { append: false })

    handler.handleSync(record('debug', 'Test FileHandler'))

    const virtualLogfileContents = fs.toJSON()['/logfile.txt']
    expect(virtualLogfileContents).not.toMatch(/^pre-existing content/)
    expect(virtualLogfileContents).toMatchSnapshot()
  })

  it('should respect the "formatter" option', () => {
    const handler = new FileHandler('/logfile.txt', {
      formatter: {
        format(record) {
          return record.level
        },
        formatBatch(records) {
          return records.map(record => this.format(record)).join('\n')
        }
      }
    })

    handler.handleSync(record('debug', 'Test FileHandler'))
    handler.handleSync(record('info', 'Test FileHandler'))
    handler.handleSync(record('notice', 'Test FileHandler'))

    const virtualLogfileContents = fs.toJSON()['/logfile.txt']
    expect(virtualLogfileContents).toBe('debug\ninfo\nnotice\n')
  })

  it('should respect the "prefix" option', () => {
    const handler = new FileHandler('/logfile.txt', {
      prefix: 'first line'
    })

    handler.handleSync(record('info'))
    handler.handleSync(record('notice'))

    expect(fs.toJSON()['/logfile.txt']).toMatchSnapshot()
  })

  it('should respect the "prefix" option (async)', async () => {
    const handler = new FileHandler('/logfile.txt', {
      prefix: 'first line'
    })

    await handler.handle(record('info'))
    await handler.handle(record('notice'))

    expect(fs.toJSON()['/logfile.txt']).toMatchSnapshot()
  })

  it('should respect the "level" option', () => {
    const handler = new FileHandler('/logfile.txt', {
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBe(false)
    expect(handler.isHandling('notice')).toBe(true)

    handler.handleSync(record('info'))
    handler.handleSync(record('notice'))

    expect(fs.toJSON()['/logfile.txt']).toMatchSnapshot()
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new FileHandler('/logfile.txt')
    const nonBubblingHandler = new FileHandler('/logfile.txt', {
      bubble: false
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBe(false)
    expect(nonBubblingHandler.handleSync(record('debug'))).toBe(true)
  })
})
