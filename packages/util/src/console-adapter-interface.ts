/**
 * An adapter which maps methods of the Console API to a logger
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Console_API
 */
export interface ConsoleAdapterInterface {
  /**
   * @inheritdoc
   */
  count: Console['count']

  /**
   * @inheritdoc
   */
  countReset: Console['countReset']

  /**
   * @inheritdoc
   */
  debug: Console['debug']

  /**
   * @inheritdoc
   */
  error: Console['error']

  /**
   * @inheritdoc
   */
  group: Console['group']

  /**
   * @inheritdoc
   */
  groupCollapsed: Console['groupCollapsed']

  /**
   * @inheritdoc
   */
  groupEnd: Console['groupEnd']

  /**
   * @inheritdoc
   */
  info: Console['info']

  /**
   * @inheritdoc
   */
  log: Console['log']

  /**
   * @inheritdoc
   */
  table:
    | Console['table']
    | ((tabularData?: any, properties?: string | string[]) => void)

  /**
   * @inheritdoc
   */
  time: Console['time']

  /**
   * @inheritdoc
   */
  timeEnd: Console['timeEnd']

  /**
   * @inheritdoc
   */
  timeLog: Console['timeLog']

  /**
   * @inheritdoc
   */
  trace: Console['trace']

  /**
   * @inheritdoc
   */
  warn: Console['warn']
}
