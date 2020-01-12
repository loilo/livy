# `@livy/slack-webhook-handler`

This [Livy](../../README.md#readme) handler sends log records to [Slack](https://slack.com/) through notifications.

---

[**Synchronous logger support:**](../../README.md#synchronous-and-asynchronous-logging) no

**Runtime:** Node.js

---

## Basic Example

```js
const { SlackWebHookHandler } = require('@livy/slack-webhook-handler')

const handler = new SlackWebHookHandler('https://example.com/logs')
```

## Installation

Install it via npm:

```bash
npm install @livy/slack-webhook-handler
```

## Options

The first argument to this handler's constructor is the [Slack webhook URL](https://api.slack.com/messaging/webhooks) to send logs to.

An object of options can be passed as the second argument.

The following options are available:

### `bubble`

**Type:** `boolean`

**Default:** `true`

**Description:** Controls whether records handled by this handler should bubble up to other handlers.

> See also: [Bubbling](../../README.md#bubbling)

### `channel`

**Type:** `string`

**Description:** Slack channel (encoded ID or name)

### `excludedFields`

**Type:** `string[]`

**Default:** `[]`

**Description:** A dot separated list of fields to exclude from slack message. E.g. `['context.field1', 'extra.field2']`.

### `formatter`

**Type:** [`FormatterInterface`](../contracts/README.md#formatterinterface)

**Default:** [`new LineFormatter()`](../console-formatter/README.md#readme) (pre-configured to respect `includeContextAndExtra`)

**Description:** The formatter to use.

### `iconEmoji`

**Type:** `string`

**Description:** The emoji name to use

### `includeContextAndExtra`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether the attachment should include context and extra data from a [log record](../../README.md#log-records)

### `level`

**Type:** [`LogLevel`](../contracts/README.md#loglevel)

**Default:** `'critical'`

**Description:** Controls which log records should be handled based on their [log level](../../README.md#log-levels).

### `useAttachment`

**Type:** `boolean`

**Default:** `true`

**Description:** Whether the message should be added to Slack as attachment (plain text otherwise).

### `username`

**Type:** `string`

**Description:** Name of a bot to deliver the message.

### `useShortAttachments`

**Type:** `boolean`

**Default:** `false`

**Description:** Whether the the context/extra messages added to Slack as attachments should be in short style.

## Public API

### `bubble`

Controls whether records handled by this handler should bubble up to other handlers. Initially set through the [`bubble`](#bubble) option.

> See also: [Bubbling](../../README.md#bubbling)

### `defaultFormatter` (read-only)

The formatter used by this handler if no [`formatter`](#formatter) option is set.

### `formatter`

This handler supports formatters by implementing the [`FormattableHandlerInterface`](../contracts/README.md#formattablehandlerinterface).

### `slackRecord` (read-only)

Get the [`SlackRecord`](src/slack-record.ts) instance associated with the handler.

### `level`

The minimum [log level](../../README.md#log-levels) of a log record to be considered by this handler. Initially set through the [`level`](#level) option.

### `processors`

This handler supports [processors](../../README.md#processors) by implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

### `reset()`

This handler implements the [`ResettableInterface`](../contracts/README.md#resettableinterface). Resetting it resets all attached processors.

> You usually don't want to call this method manually on an individual handler. Consider calling it [on the logger](../logger/README.md#reset) instead.

### `webhookUrl` (read-only)

Get the [Slack webhook URL](https://api.slack.com/messaging/webhooks) of the handler.
