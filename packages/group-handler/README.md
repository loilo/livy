# `@livy/group-handler`

This [Livy](../../README.md#readme) handler forwards log records to multiple other handlers. This is mostly useful in places where you can pass just one handler but want multiple ones to be executed (e.g. in a [restrain handler](../restrain-handler/README.md#readme)).

Combine this with a [filter handler](../filter-handler/README.md#readme) to build powerful conditional cascades.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
import { GroupHandler } from '@livy/group-handler'
import { FileHandler } from '@livy/file-handler'
import { ConsoleHandler } from '@livy/console-handler'

// Create a compound handler which logs to a file and to the terminal
const handler = new GroupHandler([
  new FileHandler('logs.txt'),
  new ConsoleHandler()
])
```

## Installation

Install it via npm:

```bash
npm install @livy/group-handler
```

## Options

The first argument to this handler's constructor is an array (or any other [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)) of handlers to group.

An object of options can be passed to the constructor as the second argument.

The following options are available:

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `sequential`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether handlers must be executed sequentially instead of in parallel. This has an effect only in [async mode](../../README.md#synchronous-and-asynchronous-logging).

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `close()`

This handler implements the [`ClosableHandlerInterface`](../contracts/README.md#closablehandlerinterface) and does internal cleanup work. When closed, it also closes all contained closable handlers.

> You usually don't want to call this method manually. It is done automatically when a Node.js process exits / a browser page is closed.

### `formatter` (write-only)

Set the formatter of all contained ([formattable](../contracts/README.md#formattablehandlerinterface)) handlers.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors and all contained resettable handlers.

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.
