# `@livy/console-handler`

This [Livy](../../README.md#readme) handler writes log records to the terminal.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers) (although in browsers, you probably want [`@livy/browser-console-handler`](../browser-console-handler/README.md#readme))

---

## Basic Example

```js
import { ConsoleHandler } from '@livy/console-handler'

const handler = new ConsoleHandler()
```

## Installation

Install it via npm:

```bash
npm install @livy/console-handler
```

## Options

An object of options can be passed to the handler constructor as the first argument.

The following options are available:

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `console`

**Type:** [`Console`](https://nodejs.org/api/console.html#console_class_console)

**Default:** [the global `console` object](https://nodejs.org/api/console.html#console_console)

**Description:** The console object to use for logging

### `formatter`

**Type:** [`FormatterInterface`](../contracts/README.md#formatterinterface)

**Default:** [`new ConsoleFormatter()`](../console-formatter/README.md#readme)

**Description:** The formatter to use.

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

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
