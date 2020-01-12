# `@livy/restrain-handler`

This [Livy](../../README.md#readme) handler wraps another handler and buffers [log records](../../README.md#log-records) passed to it until an activation condition is reached.

The advantage of this approach is that you don't get any clutter in your log files. Only incidents which actually trigger an error (or whatever your activation condition is) will be in the logs, but they will contain all records, not only those above the level threshold.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
const { RestrainHandler } = require('@livy/restrain-handler')
const { FileHandler } = require('@livy/file-handler')

const handler = new RestrainHandler(new FileHandler('logs.txt'), {
  activationStrategy: 'error'
})
```

## Installation

Install it via npm:

```bash
npm install @livy/restrain-handler
```

## Options

The first argument to this handler's constructor is a handler whose records to gate.

An object of options can be passed to the constructor as the second argument.

The following options are available:

### `activationStrategy`

**Type:** `LogLevel | (record: LogRecord) => boolean`

**Default:** `'warning'`

**Description:** Strategy which determines when this handler takes action. This can be a minimum [log level](../../README.md#log-levels) to be reached by a log record, or a callback which receives each [log record](../../README.md#log-records) and returns `true` or `false`, indicating whether the handler should be activated.

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `bufferSize`

**Type:** `number`

**Default:** `Infinity`

**Description:** Determines how many entries should be buffered at most. When the buffer exceeds this size, its oldest items are discarded.

### `stopBuffering`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether the handler should stop buffering after being triggered.

By default, when the handler is activated it will immediately start buffering again, only passing on new records when the activation condition is met again.

If this option is enabled, all log records that occur after an activation will be continuously passed on to the contained handler.

## Public API

### `activate(mode)`

Manually activate the handler and flush all buffered records. This respects the `stopBuffering` option.

A `mode` parameter needs to be passed to indicate whether the contained handler should be invoked synchronously (`'sync'`) or asynchronously (`'async'`).

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `close()`

This handler implements the [`ClosableHandlerInterface`](../contracts/README.md#closablehandlerinterface). When closed (and the buffer is not empty), it also closes its wrapped handler (if applicable).

> You usually don't want to call this method manually. It is done automatically when a Node.js process exits / a browser page is closed.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors and the wrapped handler (if applicable).

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.
