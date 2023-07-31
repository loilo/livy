# `@livy/browser-console-handler`

This [Livy](../../README.md#readme) handler writes log records to a browser console with highlighting.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** [Browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
import { BrowserConsoleHandler } from '@livy/browser-console-handler'

const handler = new BrowserConsoleHandler()
```

## Installation

Install it via npm:

```bash
npm install @livy/browser-console-handler
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

**Type:** `Console`

**Default:** [the global `console` object](https://developer.mozilla.org/en-US/docs/Web/API/Console)

**Description:** The console object to use for logging

### `timestamps`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether to include timestamps in the output

### `useNativeDebug`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether to use the browser's built-in console.debug() for the "debug" level, which is only visible in the dev tools when explicitly configured so

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `level`

The minimum [log level](../../README.md#log-levels) of a log record to be considered by this handler. Initially set through the [`level`](#level) option.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors.

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.
