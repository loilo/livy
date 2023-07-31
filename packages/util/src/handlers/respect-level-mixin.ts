import type { LogLevel } from '@livy/contracts'
import { SeverityMap } from '@livy/contracts'
import { Mixin } from '../mixin.js'

/**
 * Implements a level-respecting `isHandling` method
 */
export const RespectLevelMixin = Mixin(BaseClass => {
  return class RespectLevelMixin extends BaseClass {
    /**
     * The minimum activation level for this handler
     */
    public level: LogLevel = 'debug'

    /**
     * @inheritdoc
     */
    public isHandling(level: LogLevel) {
      return SeverityMap[level] <= SeverityMap[this.level]
    }
  }
})
