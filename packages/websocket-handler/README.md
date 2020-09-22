# `@livy/websocket-handler`

This [Livy](../../README.md#readme) handler sends log records to a [WebSocket](https://developer.mozilla.org/en-US/docs/WebSockets) using [Engine.IO](https://github.com/socketio/engine.io).

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) no

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
const { WebSocketHandler } = require('@livy/websocket-handler')

const handler = new WebSocketHandler('wss://example.com/logs')
```

## Installation

Install it via npm:

```bash
npm install @livy/websocket-handler
```

## Options

The first argument to this handler's constructor contains the WebSocket endpoint to connect to.

An object of options can be passed as the second argument.

The following options are available:

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `connection`

**Type:** `object`

**Default:** `{}`

**Description:** An object of Engine.IO [initialization options](https://github.com/socketio/engine.io#user-content-methods-1).

### `formatter`

**Type:** [`FormatterInterface`](../contracts/README.md#formatterinterface)

**Default:** [`new JsonFormatter`](../json-formatter/README.md#readme)

**Description:** The formatter to use.

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `close()`

This handler implements the [`ClosableHandlerInterface`](../contracts/README.md#closablehandlerinterface). On cleanup, it closes the WebSocket connection.

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
