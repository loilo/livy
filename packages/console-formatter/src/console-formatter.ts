import { AnsiLineFormatter } from '@livy/ansi-line-formatter'
import { EOL } from '@livy/util/lib/environment'
import { isEmpty } from '@livy/util/lib/helpers'
import chalk from 'chalk'
import { safeDump } from 'js-yaml'
const emphasize = require('emphasize')

/**
 * Formats log records with highlighting for terminals in a human-readable way
 */
export class ConsoleFormatter extends AnsiLineFormatter {
  /**
   * Format a record's context object
   *
   * @param context The context to format
   */
  protected formatContext(context: any, ignoreEmpty: boolean) {
    const formattedContext = this.formatData(context, ignoreEmpty)
    if (formattedContext.length === 0) {
      return ''
    }

    return chalk`${EOL}  {dim Context:}${EOL}${formattedContext}`
  }

  /**
   * Format a record's extra object
   *
   * @param context The extra to format
   */
  protected formatExtra(extra: any, ignoreEmpty: boolean) {
    const formattedExtra = this.formatData(extra, ignoreEmpty)
    if (formattedExtra.length === 0) {
      return ''
    }

    return chalk`${EOL}  {dim Extra:}${EOL}${formattedExtra}`
  }

  /**
   * @inheritdoc
   */
  protected formatData(object: any, ignoreEmpty: boolean) {
    if (isEmpty(object)) {
      // istanbul ignore next: This is not used throughout the library, but can be useful when extending this formatter
      return super.formatData(object, ignoreEmpty)
    } else {
      let serializedYaml = safeDump(object, { indent: 2, flowLevel: 2 })

      if (this.shouldDecorate()) {
        serializedYaml = emphasize.highlight('yaml', serializedYaml).value
      }

      return this.indent(serializedYaml)
    }
  }

  /**
   * Indents a (multiline) string with the given padding
   *
   * @param text The string to be indented
   * @param pad  The padding to be prepended on each line
   * @return string
   */
  protected indent(text: string, pad = '  ') {
    return text.replace(/^/gm, pad)
  }
}
