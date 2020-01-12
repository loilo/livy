# `@livy/http-handler`

This [Livy](../../README.md#readme) handler sends log records to an HTTP endpoint using [`got`](https://github.com/sindresorhus/got).

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) no

**Runtime:** Node.js

---

## Basic Example

```js
const { HttpHandler } = require('@livy/http-handler')

const handler = new HttpHandler('https://example.com/logs')
```

## Installation

Install it via npm:

```bash
npm install @livy/http-handler
```

## Options

The first argument to this handler's constructor determines where to send logs.

It is either

- the URL endpoint (as a string):

  ```js
  new HttpHandler('https://example.com')
  ```

- a [`got` options](https://github.com/sindresorhus/got#options) object:

  ```js
  new HttpHandler({
    url: 'https://example.com/logs',
    method: 'post'
  })
  ```

- a callback creating one of the above from a log record (or an array of log records when batch-handling and [`allowBatchRequests`](#allowbatchrequests) is enabled):

  ```js
  new HttpHandler(record => `https://example.com/logs/${record.channel}`)
  ```

---

An object of options can be passed to the constructor as the second argument.

The following options are available:

### `allowBatchRequests`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether batch handling should send all pending records as an array in one request

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

### `requestOptions`

**Type:** `object | (record: LogRecord | LogRecord[]) => object`

**Default:** `false`

**Description:** [`got` options](https://github.com/sindresorhus/got#options) to use. May be the bare options object or a callback creating that object from a log record (or an array of log records when batch-handling and [`allowBatchRequests`](#allowbatchrequests) is enabled).

### `sequential`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether HTTP requests in batch handling must be executed sequentially instead of in parallel. This has no effect if [`allowBatchRequests`](#allowbatchrequests) is enabled.

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
