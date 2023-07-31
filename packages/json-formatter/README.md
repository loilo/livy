# `@livy/json-formatter`

This [Livy](https://github.com/loilo/livy#readme) formatter formats log records as one-line JSON objects.

## Basic Example

```js
import { FileHandler } from '@livy/file-handler'
import { JsonFormatter } from '@livy/json-formatter'

const handler = new FileHandler('logs.txt', {
  formatter: new JsonFormatter()
})
```

## Installation

Install it via npm:

```bash
npm install @livy/json-formatter
```

## Options

An object of options can be passed to this formatter's constructor.

The following options are available:

### `include`

**Type:** [`Partial<IncludedRecordProperties>`](https://github.com/loilo/livy/blob/master/packages/util/README.md#includedrecordproperties)

**Default:** `{}`

**Description:** Which log record properties to include in the output. The passed object is merged into the following default:

```js
{
  datetime: true,
  channel: true,
  level: true,
  severity: true,
  message: true,
  context: true,
  extra: true
}
```

### `batchMode`

**Type:** `JsonFormatter.BATCH_MODE_NEWLINES | JsonFormatter.BATCH_MODE_JSON`

**Default:** `JsonFormatter.BATCH_MODE_NEWLINES`

**Description:** How to store batched logs. `BATCH_MODE_NEWLINES` will just put out newline-delimited JSON objects, as if log records came in sequentially. `BATCH_MODE_JSON` wraps batched records in an array and outputs that.

## Public API

### `batchMode`

How batched records are formatted. Initially set through the `batchMode` option.

### `include`

Which log record properties to include in the output. Initially set through the `include` option.
