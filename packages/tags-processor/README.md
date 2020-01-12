# `@livy/tag-processor`

This [Livy](../../README.md#readme) processor adds predefined tags to a log record's `extra` object.

---

**Runtime:** Node.js and [browsers](../../README.md#usage-in-browsers)

---

## Basic Example

```js
const { createLogger } = require('@livy/logger')
const { TagsProcessor } = require('@livy/tag-processor')

const logger = createLogger('app-logger', {
  processors: [
    // Adds `tags: ['demo', 'docs']` to the `extra` object
    new TagsProcessor('demo', 'docs')
  ]
})
```

## Installation

Install it via npm:

```bash
npm install @livy/tag-processor
```

## Options

The `TagsProcessor` constructor takes an arbitrary number of strings to inject as tags.

## Public API

### `addTags(...tags)`

Add tags to the processor. Duplicates will be removed.

### `setTags(...tags)`

Set the processor's tags.
