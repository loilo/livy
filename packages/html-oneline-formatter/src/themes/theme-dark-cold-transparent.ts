/* c8 ignore start: Themes are a source of truth, not subject to testing */
import { ThemeDarkCold } from './theme-dark-cold.js'

/**
 * Theme for HtmlOnelineFormatter with transparent background
 * Colors from hyper-snazzy
 * @see https://github.com/sindresorhus/hyper-snazzy
 */
export const ThemeDarkColdTransparent = {
  ...ThemeDarkCold,
  background: 'transparent',
} as const
