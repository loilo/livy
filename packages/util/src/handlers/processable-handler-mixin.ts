import type {
  LogRecord,
  ProcessableHandlerInterface,
  ProcessorInterfaceOrFunction,
  ResettableInterface,
} from '@livy/contracts'
import { isResettableInterface } from '../is-resettable-interface.js'
import { Mixin } from '../mixin.js'

/**
 * Adds basic processor-handling functionality
 */
const ProcessableHandlerMixin = Mixin(BaseClass => {
  return class ProcessableHandlerMixin
    extends BaseClass
    implements ProcessableHandlerInterface, ResettableInterface
  {
    /**
     * @protected This should not be public, but is forced to be due to microsoft/typescript#17744
     */
    public _processors = new Set<ProcessorInterfaceOrFunction>()

    /**
     * @inheritdoc
     */
    public get processors() {
      return this._processors
    }

    /**
     * Processes a record.
     *
     * @protected This should not be public, but is forced to be due to microsoft/typescript#17744
     * @param record
     */
    public processRecord(record: LogRecord) {
      if (this._processors.size > 0) {
        for (const processor of this._processors) {
          if (typeof processor === 'function') {
            record = processor(record)
          } else {
            record = processor.process(record)
          }
        }
      }

      return record
    }

    /**
     * Reset processors
     * @protected This should not be public, but is forced to be due to microsoft/typescript#17744
     */
    public resetProcessors() {
      for (const processor of this._processors) {
        if (isResettableInterface(processor)) {
          processor.reset()
        }
      }
    }

    /**
     * @inheritdoc
     */
    public reset() {
      this.resetProcessors()
    }
  }
})

export { ProcessableHandlerMixin }
