import type {
  FormattableHandlerInterface,
  FormatterInterface,
} from '@livy/contracts'
import { LineFormatter } from '../formatters/line-formatter.js'
import { Mixin } from '../mixin.js'

/**
 * Adds basic formatter functionality
 */
export const FormattableHandlerMixin = Mixin(BaseClass => {
  return class FormattableHandlerMixin
    extends BaseClass
    implements FormattableHandlerInterface
  {
    /**
     * @protected This should not be public, but is forced to be due to microsoft/typescript#17744
     */
    public explicitFormatter?: FormatterInterface

    /**
     * Get the default formatter
     *
     * This exists to be overridden, because getters/setters of mixins can not
     * be properly overridden due to TS2611
     *
     * @protected This should also not be public, but is forced to be due to microsoft/typescript#17744
     */
    public getDefaultFormatter(): FormatterInterface {
      return new LineFormatter()
    }

    /**
     * @inheritdoc
     */
    public get defaultFormatter(): FormatterInterface {
      return this.getDefaultFormatter()
    }

    /**
     * @inheritdoc
     */
    public set formatter(formatter: FormatterInterface) {
      this.setFormatter(formatter)
    }

    /**
     * @inheritdoc
     */
    public get formatter() {
      return this.getFormatter()
    }

    /**
     * Get the formatter
     *
     * This exists to be overridden, because getters/setters of mixins can not
     * be properly overridden due to TS2611
     *
     * @protected This should also not be public, but is forced to be due to microsoft/typescript#17744
     */
    public setFormatter(formatter: FormatterInterface) {
      this.explicitFormatter = formatter
    }

    /**
     * Set the formatter
     *
     * This exists to be overridden, because getters/setters of mixins can not
     * be properly overridden due to TS2611
     *
     * @protected This should also not be public, but is forced to be due to microsoft/typescript#17744
     */
    public getFormatter() {
      // Default formatter is committed as the handler's formatter
      // as soon as the formatter is requested
      if (this.explicitFormatter === undefined) {
        this.explicitFormatter = this.defaultFormatter
      }

      return this.explicitFormatter!
    }
  }
})
