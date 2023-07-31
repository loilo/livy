# `@livy/html-pretty-formatter`

This [Livy](../../README.md#readme) formatter formats log records as extensive HTML.

## Basic Example

```js
import { FileHandler } from '@livy/file-handler'
import { HtmlPrettyFormatter } from '@livy/html-pretty-formatter'

const handler = new FileHandler('logs.html', {
  formatter: new HtmlPrettyFormatter()
})
```

## Installation

Install it via npm:

```bash
npm install @livy/html-pretty-formatter
```
