# `@livy/memory-usage-processor`

This [Livy](../../README.md#readme) processor injects current memory usage into a log record's `extra` object.

---

**Runtime:** Node.js

---

## Basic Example

```js
import { createLogger } from '@livy/logger'
import { MemoryUsageProcessor } from '@livy/memory-usage-processor'

const logger = createLogger('app-logger', {
  processors: [new MemoryUsageProcessor()]
})
```

## Installation

Install it via npm:

```bash
npm install @livy/memory-usage-processor
```

## Options

The `MemoryUsageProcessor` constructor takes an optional boolean `humanReadable` parameter (which defaults to `true`). It formats memory usage in a human readable way. Turn it off to inject the raw number of bytes.
