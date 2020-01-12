/**
 * An map of HTML highlight tokens to be colored by a theme
 */
export interface HtmlFormatterThemeInterface {
  background?: string
  text?: string
  punctuation?: string
  level_emergency?: string
  level_alert?: string
  level_critical?: string
  level_error?: string
  level_warning?: string
  level_notice?: string
  level_info?: string
  level_debug?: string
  data_key?: string
  data_value_string?: string
  data_value_number?: string
  data_value_literal?: string
}
