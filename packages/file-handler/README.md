# `@livy/file-handler`

This [Livy](../../README.md#readme) handler writes log records to a file.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js

---

## Basic Example

```js
import { FileHandler } from '@livy/file-handler'

const handler = new FileHandler('logs.txt')
```

## Installation

Install it via npm:

```bash
npm install @livy/file-handler
```

## Options

The first argument to this handler's constructor is a file path to write to.

An object of options can be passed to the constructor as the second argument.

The following options are available:

### `append`

**Type:** `boolean`

**Default:** `true`

**Description:** Whether DOM elements should be added at the beginning of the container instead of the end

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

### `prefix`

**Type:** `string | string[]`

**Default:** `[]`

**Description:** Prepend one or more lines to the file when it's first created. This can be useful to prepend header data, like in CSV.

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
