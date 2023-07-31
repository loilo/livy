import { AnsiLineFormatter } from '@livy/ansi-line-formatter'
import { EOL } from '@livy/util/environment'
import { isEmpty } from '@livy/util/helpers'
import chalk from 'chalk'
import { dump } from 'js-yaml'
import { emphasize } from 'emphasize'
import chalkTemplate from 'chalk-template'

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

    return chalkTemplate`${EOL}  {dim Context:}${EOL}${formattedContext}`
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

    return chalkTemplate`${EOL}  {dim Extra:}${EOL}${formattedExtra}`
  }

  /**
   * Clone a value but replace any occurrences of `value` in it
   *
   * @param container   The container to strip `value` from
   * @param value       The value to replace
   * @param replacement The string to put in place of undefined
   * @param cache       The internal cache used to avoid cycles
   */
  private cloneAndReplace(
    container: any,
    value: any,
    replacement: string,
    cache = new Map(),
  ): any {
    if (container === value) {
      return replacement
    }

    if (cache.has(container)) {
      return cache.get(container)
    }

    if (Array.isArray(container)) {
      const result = container.map(entry =>
        this.cloneAndReplace(entry, value, replacement, cache),
      )
      cache.set(container, result)
      return result
    }

    if (typeof container === 'object' && container !== null) {
      const copy = { ...container }
      for (const key in copy) {
        copy[key] = this.cloneAndReplace(copy[key], value, replacement, cache)
      }
      cache.set(container, copy)

      return copy
    }

    return container
  }

  /**
   * @inheritdoc
   */
  protected formatData(object: any, ignoreEmpty: boolean) {
    if (isEmpty(object)) {
      /* c8 ignore next: This is not used throughout the library, but can be useful when extending this formatter */
      return super.formatData(object, ignoreEmpty)
    } else {
      // We need to replace `undefined` and `null` values because they are
      // useful being represented but they cannot be serialized as YAML.
      // Since we merely use YAML as a human-readable data visualization tool here,
      // it's completely fine to have output that would not be properly parseable.

      // Generate a random alphanumeric string as replacement
      // for occurrences of undefined/null
      // Prefix with a letter ("x") to avoid random strings starting with a number
      // from being interpreted as a number by the YAML highlighter (which
      // prevents proper replacement in the end)
      const generateRandomString = () =>
        'x' +
        Math.random().toString(36).slice(2, 15) +
        Math.random().toString(36).slice(2, 15)

      const undefinedReplacement = generateRandomString()
      const nullReplacement = generateRandomString()

      // Replace all undefined/null occurrences in the object
      // with the generated random strings
      let sanitizedObject = object
      sanitizedObject = this.cloneAndReplace(
        sanitizedObject,
        undefined,
        undefinedReplacement,
      )
      sanitizedObject = this.cloneAndReplace(
        sanitizedObject,
        null,
        nullReplacement,
      )

      let serializedYaml = dump(sanitizedObject, {
        skipInvalid: true,
        indent: 2,
        flowLevel: 2,
      })

      // Empty object string may result from skipped invalid data like JS functions
      if (serializedYaml.trim() === '{}') {
        return super.formatData({}, ignoreEmpty)
      }

      if (this.shouldDecorate()) {
        serializedYaml = emphasize.highlight('yaml', serializedYaml).value
      }

      // Replace the generated random strings with a dimmed "undefined"/"null"
      serializedYaml = serializedYaml
        .replaceAll(
          new RegExp(undefinedReplacement, 'g'),
          chalk.gray('undefined'),
        )
        .replaceAll(new RegExp(nullReplacement, 'g'), chalk.gray('null'))

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
    return text.replaceAll(/^/gm, pad)
  }
}
