# `@livy/html-pretty-formatter`

This [Livy](../../README.md#readme) formatter formats log records as extensive HTML.

## Basic Example

```js
const { FileHandler } = require('@livy/file-handler')
const { HtmlPrettyFormatter } = require('@livy/html-pretty-formatter')

const handler = new FileHandler('logs.html', {
  formatter: new HtmlPrettyFormatter()
})
```

## Installation

Install it via npm:

```bash
npm install @livy/html-pretty-formatter
```
