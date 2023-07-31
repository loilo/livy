import { describe, expect, it, vi } from 'vitest'
import {
  AbstractFormattingProcessingHandler,
  AbstractSyncFormattingProcessingHandler
} from '../../src/handlers/abstract-formatting-processing-handler'

const { record } = livyTestGlobals

describe('@livy/util/lib/handlers/abstract-formatting-processing-handler', () => {
  describe('AbstractFormattingProcessingHandler', () => {
    class Handler extends AbstractFormattingProcessingHandler {
      constructor(...args) {
        super(...args)

        this.write = vi.fn(() => !this.bubble)
      }
    }

    it('should batch the "handle" method in order', async () => {
      const testRecord = record(
        'debug',
        'Test AbstractFormattingProcessingHandler'
      )

      const handler = new Handler()
      await handler.handle(testRecord)

      expect(handler.write).toHaveBeenCalledTimes(1)
      expect(handler.write).toHaveBeenLastCalledWith(
        testRecord,
        '2015-08-15 14:30:00 DEBUG Test AbstractFormattingProcessingHandler {}'
      )
    })

    it('should respect the "level" option', async () => {
      const handler = new Handler({
        level: 'notice'
      })

      expect(await handler.handle(record('debug'))).toBe(false)
      expect(handler.write).not.toHaveBeenCalled()
    })

    it('should respect the "bubble" option', async () => {
      const bubblingHandler = new Handler()
      const nonBubblingHandler = new Handler({
        bubble: false
      })

      expect(await bubblingHandler.handle(record('debug'))).toBe(false)
      expect(await nonBubblingHandler.handle(record('debug'))).toBe(true)
    })
  })

  describe('AbstractSyncFormattingProcessingHandler', () => {
    class SyncHandler extends AbstractSyncFormattingProcessingHandler {
      constructor(...args) {
        super(...args)

        this.writeSync = vi.fn(() => !this.bubble)
      }
    }

    it('should batch the "handleSync" method', () => {
      const testRecord = record(
        'debug',
        'Test AbstractFormattingProcessingHandler'
      )

      const handler = new SyncHandler()
      handler.handleSync(testRecord)

      expect(handler.writeSync).toHaveBeenCalledTimes(1)
      expect(handler.writeSync).toHaveBeenLastCalledWith(
        testRecord,
        '2015-08-15 14:30:00 DEBUG Test AbstractFormattingProcessingHandler {}'
      )
    })

    it('should default to wrapping "writeSync" in async mode', async () => {
      const testRecord = record(
        'debug',
        'Test AbstractFormattingProcessingHandler'
      )

      const handler = new SyncHandler()
      await handler.handle(testRecord)

      expect(handler.writeSync).toHaveBeenCalledTimes(1)
      expect(handler.writeSync).toHaveBeenLastCalledWith(
        testRecord,
        '2015-08-15 14:30:00 DEBUG Test AbstractFormattingProcessingHandler {}'
      )
    })

    it('should respect the "level" option', () => {
      const handler = new SyncHandler({
        level: 'notice'
      })

      expect(handler.handleSync(record('debug'))).toBe(false)
      expect(handler.writeSync).not.toHaveBeenCalled()
    })

    it('should respect the "bubble" option', () => {
      const bubblingHandler = new SyncHandler()
      const nonBubblingHandler = new SyncHandler({
        bubble: false
      })

      expect(bubblingHandler.handleSync(record('debug'))).toBe(false)
      expect(nonBubblingHandler.handleSync(record('debug'))).toBe(true)
    })
  })
})
