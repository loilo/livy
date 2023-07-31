# `@livy/mail-handler`

This [Livy](../../README.md#readme) handler dispenses log records via email using [Nodemailer](https://www.npmjs.com/package/nodemailer).

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) no

**Runtime:** Node.js

---

## Basic Example

```js
import { MailHandler } from '@livy/mail-handler'

const handler = new MailHandler({
  subject: 'Hello world!',
  to: 'receiver@example.com',
  from: 'sender@example.com'
})
```

## Installation

Install it via npm:

```bash
npm install @livy/mail-handler
```

## Options

An object of options must be passed to the handler constructor as the first argument.

The following options are available:

### `from` (required)

**Type:** `string`

**Description:** The sender of the emails to send.

### `subject` (required)

**Type:** `string`

**Description:** The subject of the emails to send. All properties of the corresponding [log record](../../README.md#log-levels) are available as `%tokens%`, for example `%channel%` will be replaced with the record's channel.

### `to` (required)

**Type:** `string | string[]`

**Description:** One or more receivers of the emails

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'warning'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

### `htmlFormatter`

**Type:** [`FormatterInterface`](../contracts/README.md#formatterinterface)

**Default:** [`new HtmlPrettyFormatter()`](../html-pretty-formatter/README.md#readme)

**Description:** The formatter for the HTML part of mails.

### `plainTextFormatter`

**Type:** [`FormatterInterface`](../contracts/README.md#formatterinterface)

**Default:** [`new LineFormatter()`](../line-formatter/README.md#readme)

**Description:** The formatter for the plain text part of mails.

### `template`

**Type:** `object`

**Default:** `{ html: '%logs%', text: '%logs%' }`

**Description:** A template for either HTML or plain text emails or both. The `%logs%` token will be replaced with the formatted log record(s).

### `transport`

**Type:** `object`

**Default:** `{ sendmail: true }`

**Description:** Nodemailer transport options (e.g. for using SMTP). Available options can be looked up in the [Nodemailer docs](https://nodemailer.com/smtp/).

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `defaultHtmlFormatter` (read-only)

The default formatter used for emails' HTML parts.

### `defaultPlainTextFormatter` (read-only)

The default formatter used for emails' plain text parts.

### `level`

The minimum [log level](../../README.md#log-levels) of a log record to be considered by this handler. Initially set through the [`level`](#level) option.

### `htmlFormatter`

The formatter used for the HTML part of mails. Initially set through the [`htmlFormatter`](#htmlformatter) option.

### `plainTextFormatter`

The formatter used for the plain text part of mails. Initially set through the [`plainTextFormatter`](#plaintextformatter) option.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors.

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.
