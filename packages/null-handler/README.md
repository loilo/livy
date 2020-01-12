# `@livy/null-handler`

This [Livy](../../README.md#readme) handler acts as a black hole. Any record it can handle will be thrown away. This can be used to put on top of an existing stack to override it temporarily.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
const { NullHandler } = require('@livy/null-handler')

const handler = new NullHandler('error')
```

## Installation

Install it via npm:

```bash
npm install @livy/null-handler
```

## Options

This handler's constructor accepts an optional minimum [log level](../../README.md#log-levels) (defaulting to `'debug'`). All log records below that level will regularly bubble up the stack, everything else will be thrown away.
