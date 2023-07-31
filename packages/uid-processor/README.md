# `@livy/uid-processor`

This [Livy](../../README.md#readme) processor adds a unique identifier to a log record's `extra` object. The identifier is _not_ unique per-record but created with the `UidProcessor` instance.

---

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
import { createLogger } from '@livy/logger'
import { UidProcessor } from '@livy/uid-processor'

const logger = createLogger('app-logger', {
  processors: [new UidProcessor()]
})
```

## Installation

Install it via npm:

```bash
npm install @livy/uid-processor
```

## Options

The `UidProcessor` constructor takes the length of the unique identifier (in bytes, the actual identifier will be a hex string of double the length), defaulting to `7`.

## Public API

### `reset()`

This processor implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting will generate a new identifier.

> You usually don't want to call this method manually on an individual processor. Consider calling it [on the logger](../logger/README.md#reset) instead.

### `uid`

Get the generated unique identifier.
