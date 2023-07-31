# `@livy/level-filter-handler`

This [Livy](../../README.md#readme) handler wraps another handler and filters records based on a lower/upper level bound.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
import { LevelFilterHandler } from '@livy/level-filter-handler'
import { FileHandler } from '@livy/file-handler'

const handler = new LevelFilterHandler(
  new FileHandler('semi-serious-logs.txt'),
  { minLevel: 'notice', maxLevel: 'warning' }
)
```

## Installation

Install it via npm:

```bash
npm install @livy/level-filter-handler
```

## Options

The first argument to this handler's constructor is a handler whose records to gate.

An object of options can be passed to the constructor as the second argument.

The following options are available:

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `minLevel`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** The minimum activation level for the wrapped handler

### `maxLevel`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** The maximum activation level for the wrapped handler

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `close()`

This handler implements the [`ClosableHandlerInterface`](../contracts/README.md#closablehandlerinterface) and does internal cleanup work. When closed, it also closes its wrapped handler (if applicable).

> You usually don't want to call this method manually. It is done automatically when a Node.js process exits / a browser page is closed.

### `getAcceptedLevels()`

Get an array of accepted log levels.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors and the wrapped handler (if applicable).

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.

### `setAcceptedLevels(minLevel, maxLevel)`

Set the range of accepted log levels.
