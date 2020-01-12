# `@livy/stream-handler`

This [Livy](../../README.md#readme) handler writes log records to a [Node.js stream](https://nodejs.org/api/stream.html#stream_writable_streams).

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) no

**Runtime:** Node.js

---

## Basic Example

```js
const { StreamHandler } = require('@livy/stream-handler')

const handler = new StreamHandler('wss://example.com/logs')
```

## Installation

Install it via npm:

```bash
npm install @livy/stream-handler
```

## Options

The first argument to this handler's constructor is a [writable Node.js stream](https://nodejs.org/api/stream.html#stream_writable_streams) to write log records to.

An object of options can be passed as the second argument.

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

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `defaultFormatter`

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
