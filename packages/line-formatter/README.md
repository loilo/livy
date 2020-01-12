# `@livy/line-formatter`

This [Livy](../../README.md#readme) formatter formats log records as single lines.

## Basic Example

```js
const { FileHandler } = require('@livy/file-handler')
const { LineFormatter } = require('@livy/line-formatter')

const handler = new FileHandler('logs.txt', {
  formatter: new LineFormatter()
})
```

## Installation

Install it via npm:

```bash
npm install @livy/line-formatter
```

## Options

An object of options can be passed to this formatter's constructor.

The following options are available:

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

### `ignoreEmptyContext`

Whether to omit empty context objects (only if extra is empty as well). Initially set through the `ignoreEmptyContext` option.

### `ignoreEmptyExtra`

Whether to omit empty `extra` objects. Initially set through the `ignoreEmptyExtra` option.

### `include`

Which log record properties to include in the output. Initially set through the `include` option.
