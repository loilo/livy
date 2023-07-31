# `@livy/process-id-processor`

This [Livy](../../README.md#readme) processor injects the current process ID into a log record's `extra` object.

---

**Runtime:** Node.js

---

## Basic Example

```js
import { createLogger } from '@livy/logger'
import { ProcessIdProcessor } from '@livy/process-id-processor'

const logger = createLogger('app-logger', {
  processors: [ProcessIdProcessor]
})
```

## Installation

Install it via npm:

```bash
npm install @livy/process-id-processor
```
