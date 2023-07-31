# `@livy/html-oneline-formatter`

This [Livy](../../README.md#readme) formatter formats log records as single-line HTML.

## Basic Example

```js
import { FileHandler } from '@livy/file-handler'
import { HtmlOnelineFormatter } from '@livy/html-oneline-formatter'

const handler = new FileHandler('logs.html', {
  formatter: new HtmlOnelineFormatter()
})
```

## Installation

Install it via npm:

```bash
npm install @livy/html-oneline-formatter
```

## Options

An object of options can be passed to this formatter's constructor.

The following options are available:

### `include`

**Type:** [`Partial<IncludedRecordProperties>`](../util/README.md#includedrecordproperties)

**Default:** `{}`

**Description:** Which log record properties to include in the output. The passed object is merged into the following default:

```js
{
  datetime: true,
  channel: false,
  level: true,
  severity: false,
  message: true,
  context: true,
  extra: true
}
```

### `theme`

**Type:** [`HtmlFormatterThemeInterface`](src/themes/html-formatter-theme-interface.ts)

**Default:** `{}`

**Description:** The color theme to use. A couple of included themes can be found [in the themes folder](src/themes).

### `wrap`

**Type:** [`HtmlFormatterThemeInterface`](src/themes/html-formatter-theme-interface.ts)

**Default:** `false`

**Description:** Whether to allow lines to wrap when they're too long for the display.

## Public API

### `include`

Which log record properties to include in the output. Initially set through the `include` option.

### `theme`

The color theme to use. Initially set through the `theme` option.

### `wrap`

Whether to allow lines to wrap when they're too long for the display. Initially set through the `wrap` option.
