/* c8 ignore start: Themes are a source of truth, not subject to testing */
import { ThemeDark } from './theme-dark.js'

/**
 * Theme for HtmlOnelineFormatter with transparent background
 * Colors from Field Lights
 * @see https://marketplace.visualstudio.com/items?itemName=sveggiani.vscode-field-lights
 */
export const ThemeDarkTransparent = {
  ...ThemeDark,
  background: 'transparent',
} as const
