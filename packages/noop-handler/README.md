# `@livy/noop-handler`

This [Livy](../../README.md#readme) handler handles anything, but does nothing, and does not stop bubbling to the rest of the stack. This can be useful for testing.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) yes

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
import { NoopHandler } from '@livy/noop-handler'

const handler = new NoopHandler()
```

## Installation

Install it via npm:

```bash
npm install @livy/noop-handler
```
