# `@livy/logger`

The [Livy](../../README.md#readme) logger factory is at the heart of every logger, as it creates a new logger instance.

## Basic Example

```js
import { createLogger } from '@livy/logger'

const logger = createLogger('app-logger')
```

## Installation

Install it via npm:

```bash
npm install @livy/logger
```

## Options

The `createLogger` function takes a mandatory channel name as its first parameter. A second argument may be provided with object of options:

### `autoClose`

**Type:** `boolean`

**Default:** `true`

**Description:** Whether to automatically run the logger's `close` method when the Node.js process exits / the browser page closes.

### `handlers`

**Type:** [`Iterable<HandlerInterface | SyncHandlerInterface>`](../contracts/README.md#handlerinterface)

**Default:** `[]`

**Description:** Handlers of the logger.

### `mode`

**Type:** `'sync' | 'async' | 'mixed'`

**Default:** `'mixed'`

**Description:** The [concurrency mode](../../README.md#synchronous-and-asynchronous-logging) of the logger.

### `processors`

**Type:** [`Iterable<ProcessorInterfaceOrFunction>`](../contracts/README.md#processorinterfaceprocessorfunction)

**Default:** `[]`

**Description:** Processors of the logger.

### `timezone`

**Type:** `string` (IANA name)

**Default:** The runtime's time zone, determined by the [`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API.

**Description:** The time zone the logger should use.

## Logging

Logs can be created with the `log()` method. It takes a [log level](../../README.md#log-levels), a message and an optional context object:

```js
logger.log('info', 'This is the logged message')
```

Note that the `log` method returns a Promise in [`async` mode](#mode), so it should be awaited to avoid unexpected failures:

```js
await logger.log('info', 'This is the logged message')
```

---

For each log level, there is a convenience method which allows omitting the level parameter:

```js
logger.debug('This is a debug message')
logger.info('This is an info message')
logger.notice('This is a notice message')
logger.warning('This is a warning message')
logger.error('This is an error message')
logger.alert('This is an alert message')
logger.critical('This is a critical message')
logger.emergency('This is an emergency message')
```

## Public API

### `reset()`

Resetting a logger will reset all its handlers and processors which implement the [`ResettableInterface`](../contracts/README.md#resettableinterface).

### `name` (read-only)

The logger's channel name.

### `withName(name)`

Clone the logger with a new name.

### `timezone` (read-only)

The logger's IANA time zone name.
