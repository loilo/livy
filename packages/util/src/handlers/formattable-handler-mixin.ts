import { FormattableHandlerInterface } from '@livy/contracts/lib/formattable-handler-interface'
import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LineFormatter } from '../formatters/line-formatter'
import { Mixin } from '../mixin'

/**
 * Adds basic formatter functionality
 */
export const FormattableHandlerMixin = Mixin(BaseClass => {
  return class FormattableHandlerMixin extends BaseClass
    implements FormattableHandlerInterface {
    /**
     * @protected This should not be public, but is forced to be due to microsoft/typescript#17744
     */
    public explicitFormatter?: FormatterInterface

    /**
     * Get the default formatter
     * @protected This should not be public, but is forced to be due to microsoft/typescript#17744
     */
    public get defaultFormatter(): FormatterInterface {
      return new LineFormatter()
    }

    /**
     * @inheritdoc
     */
    public set formatter(formatter: FormatterInterface) {
      this.explicitFormatter = formatter
    }

    /**
     * @inheritdoc
     */
    public get formatter() {
      // Default formatter is committed as the handler's formatter
      // as soon as the formatter is requested
      if (typeof this.explicitFormatter === 'undefined') {
        this.explicitFormatter = this.defaultFormatter
      }

      return this.explicitFormatter!
    }
  }
})
