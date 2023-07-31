# `@livy/csv-formatter`

This [Livy](../../README.md#readme) formatter formats log records as CSV lines.

## Basic Example

```js
import { FileHandler } from '@livy/file-handler'
import { CsvFormatter } from '@livy/csv-formatter'

const handler = new FileHandler('logs.csv', {
  formatter: new CsvFormatter()
})
```

## Installation

Install it via npm:

```bash
npm install @livy/csv-formatter
```

## Options

An object of options can be passed to this formatter's constructor.

The following options are available:

### `delimiter`

**Type:** `string`

**Default:** `','`

**Description:** The delimiter to separate columns.

### `enclosure`

**Type:** `string`

**Default:** `'"'`

**Description:** The string to enclose fields.

### `eol`

**Type:** `string`

**Default:** `'\r\n'`

**Description:** The line terminator string.

### `generateFields`

**Type:** `function`

**Default:** A generator which includes date/time (as ISO 8601 string), log level, message, and JSON-serialized context and extra objects.

**Description:** A function to map each [log record](../../README.md#log-records) to an array of strings which represent the fields of each CSV line.
