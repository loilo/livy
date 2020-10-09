# `@livy/rotating-file-handler`

This [Livy](../../README.md#readme) handler stores log records to files that are rotated by date/time or file size and only a limited number of files is kept.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js

---

## Basic Example

```js
const { RotatingFileHandler } = require('@livy/rotating-file-handler')

const handler = new RotatingFileHandler('logs-%date%.txt')
```

## Installation

Install it via npm:

```bash
npm install @livy/rotating-file-handler
```

## Options

The first argument to this handler's constructor is a file path to write to. It needs to contain a token based on the configured [`strategy`](#strategy).

An object of options can be passed to the constructor as the second argument.

The following options are available:

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `formatter`

**Type:** [`FormatterInterface`](../contracts/README.md#formatterinterface)

**Default:** [`new LineFormatter()`](../line-formatter/README.md#readme)

**Description:** The formatter to use.

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

### `maxFiles`

**Type:** `number`

**Default:** `Infinity`

**Description:** Number of log files to keep at maximum.

### `strategy`

**Type:** `'max-age' | 'max-size'`

**Default:** `'max-age'`

**Description:** The strategy name:

- `max-age`: Separates log files by the date/time attached to log records thus creates a new file every year/month/day/hour/minute. It requires a `%date%` token in the file name.
- `max-size`: Separates log files by the size of the latest log file and thus creates a new file whenever the current file exceeds the size. It requires a `%appendix%` token in the file name.

### `threshold`

The value this option takes varies based on the [`strategy`](#strategy) option:

#### Strategy `max-age`

**Type:** `'minute' | 'hour' | 'day' | 'month' | 'year'`

**Default:** `'day'`

**Description:** The duration unit that separates individual log files. Using `'day'` rotates the log files daily, using `'hour'` rotates them every hour etc.

#### Strategy `max-size`

**Type:** `number | string`

**Description:** The file size that separates individual log files. May be a plain number of bytes or a file size string like `'200 kb'`, `'1.5M'` etc.

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `close()`

This handler implements the [`ClosableHandlerInterface`](../contracts/README.md#closablehandlerinterface). On cleanup, it closes the internal file handler.

> You usually don't want to call this method manually. It is done automatically when a Node.js process exits / a browser page is closed.

### `defaultFormatter` (read-only)

The formatter used by this handler if no [`formatter`](#formatter) option is set.

### `formatter`

This handler supports formatters by implementing the [`FormattableHandlerInterface`](../contracts/README.md#formattablehandlerinterface).

### `level`

The minimum [log level](../../README.md#log-levels) of a log record to be considered by this handler. Initially set through the [`level`](#level) option.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors.

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.
