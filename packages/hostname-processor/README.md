# `@livy/hostname-processor`

This [Livy](../../README.md#readme) processor injects the running machine's hostname into a log record's `extra` object.

---

**Runtime:** Node.js

---

## Basic Example

```js
const { createLogger } = require('@livy/logger')
const { HostnameProcessor } = require('@livy/hostname-processor')

const logger = createLogger('app-logger', {
  processors: [HostnameProcessor]
})
```

## Installation

Install it via npm:

```bash
npm install @livy/hostname-processor
```
