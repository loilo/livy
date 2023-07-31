/* c8 ignore start: Themes are a source of truth, not subject to testing */
import { ThemeLight } from './theme-light.js'

/**
 * Theme for HtmlOnelineFormatter with transparent background
 * Colors from snazzy-light
 * @see https://marketplace.visualstudio.com/items?itemName=loilo.snazzy-light
 */
export const ThemeLightTransparent = {
  ...ThemeLight,
  background: 'transparent',
} as const
