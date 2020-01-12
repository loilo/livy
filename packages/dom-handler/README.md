# `@livy/dom-handler`

This [Livy](../../README.md#readme) handler writes log records to the browser's DOM.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** [Browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
const { DomHandler } = require('@livy/dom-handler')

const handler = new DomHandler('#logs')
```

## Installation

Install it via npm:

```bash
npm install @livy/dom-handler
```

## Options

The first argument to this handler's constructor is a selector string or a [DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element) to write the log records to.

> **Note:** If you pass a selector string, it will immediately try to find it in the DOM tree. If no results are yielded, the selector will be looked up again once the DOM [finished loading](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event). If no according element is found by then, the handler will throw an error.
>
> If you're running your logger in [async mode](../../README.md#synchronous-and-asynchronous-logging), logged records will simply be deferred until that point. However, if you're logging in mixed or sync mode, the logger will throw an error if no target element has been found yet.

An object of options can be passed to the constructor as the second argument.

The following options are available:

### `autoScroll`

**Type:** `'edge' | 'force' | 'none'`

**Default:** `'edge'`

**Description:** Scroll behavior when new log records are added:

- `edge`: scroll new entry into view if container has previously been scrolled to the edge
- `force`: always scroll new entries into view
- `none`: no automatic scrolling

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `formatter`

**Type:** [`FormatterInterface`](../contracts/README.md#formatterinterface)

**Default:** [`new HtmlPrettyFormatter()`](../html-pretty-formatter/README.md#readme)

**Description:** The formatter to use.

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'debug'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

### `reversed`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether DOM elements should be added at the beginning of the container instead of the end

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `close()`

This handler implements the [`ClosableHandlerInterface`](../contracts/README.md#closablehandlerinterface) and does internal cleanup work.

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
