# `@livy/filter-handler`

This [Livy](../../README.md#readme) handler wraps another handler and filters [log records](../../README.md#log-records) passed to it based on a test callback.

Combine this with a [group handler](../group-handler/README.md#readme) to build powerful conditional cascades.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
const { FilterHandler } = require('@livy/filter-handler')
const { FileHandler } = require('@livy/file-handler')

// Write logs appearing between 0am and 6am to a special file
const handler = new FilterHandler(
  new FileHandler('nightly-logs.txt'),
  record => record.datetime.hour >= 0 && record.datetime.hour <= 5
)
```

## Installation

Install it via npm:

```bash
npm install @livy/filter-handler
```

## Options

The first argument to this handler's constructor is a handler whose records to gate. The second argument is a callback that takes a [log record](../../README.md#log-records) and returns `true` or `false`, indicating whether or not that record should be forwarded to the wrapped handler.

An object of options can be passed to the handler constructor as the third argument.

The following options are available:

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `close()`

This handler implements the [`ClosableHandlerInterface`](../contracts/README.md#closablehandlerinterface) and does internal cleanup work. When closed, it also closes its wrapped handler (if applicable).

> You usually don't want to call this method manually. It is done automatically when a Node.js process exits / a browser page is closed.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors and the wrapped handler (if applicable).

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.
