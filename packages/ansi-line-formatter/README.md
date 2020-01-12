# `@livy/ansi-line-formatter`

This [Livy](../../README.md#readme) formatter formats log records as single lines with terminal highlighting.

## Basic Example

```js
const { FileHandler } = require('@livy/file-handler')
const { AnsiLineFormatter } = require('@livy/ansi-line-formatter')

const handler = new FileHandler('logs.txt', {
  formatter: new AnsiLineFormatter()
})
```

## Installation

Install it via npm:

```bash
npm install @livy/ansi-line-formatter
```

## Options

An object of options can be passed to this formatter's constructor.

The following options are available:

### `decorated`

**Type:** `boolean | undefined`

**Default:** `undefined`

**Description:** Whether records should be highlighted with ANSI escape sequences. If this option is not provided (or explicitly set to `undefined`), color support will be detected automatically.

### `ignoreEmptyContext`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether to omit empty context objects (only if extra is empty as well).

### `ignoreEmptyExtra`

**Type:** `boolean`

**Default:** `true`

**Description:** Whether to omit empty `extra` objects.

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

## Public API

### `decorated`

Whether records should be highlighted with ANSI escape sequences. Initially set through the `decorated` option.

### `ignoreEmptyContext`

Whether to omit empty context objects (only if extra is empty as well). Initially set through the `ignoreEmptyContext` option.

### `ignoreEmptyExtra`

Whether to omit empty `extra` objects. Initially set through the `ignoreEmptyExtra` option.

### `include`

Which log record properties to include in the output. Initially set through the `include` option.
