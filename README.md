<div align="center">
  <img src="logo.svg" alt="Livy logo: The &quot;Livy&quot; lettering next to a scroll" width="360" height="120">
  <br><br><br>
</div>

[![Test status on Travis](https://badgen.net/travis/loilo/livy)](https://travis-ci.org/loilo/vuelivy)
[![Test coverage on CodeCov](https://badgen.net/codecov/c/github/loilo/livy)](https://codecov.io/gh/loilo/livy)

_Livy_ is a flexible JavaScript logger heavily inspired by [Monolog](https://github.com/seldaek/monolog).

## Motivation

![Livy Quote: "The study of history is the best medicine."](quote.svg)

Livy aims to be the one logger used throughout your Node.js application. Therefore, it does not assume anything about your project and how it wants to do logging, but provides all the buildings blocks to quickly assemble a logger suited to your needs. It basically is a logging construction kit.

Want to see an example?

<!-- prettier-ignore -->
```js
const { createLogger } = require('@livy/logger')
const { SlackWebhookHandler } = require('@livy/slack-webhook-handler')
const { RotatingFileHandler } = require('@livy/rotating-file-handler')

// Give your log channel a name and you're good to go
const logger = createLogger('app-logger')

logger.handlers
  // Write daily rotating, automatically deleted log files
  .add(new RotatingFileHandler('/var/log/livy-%date%.log', {
    level: 'info',
    maxFiles: 30
  }))

  // Get instant notifications under critical conditions
  .add(new SlackWebhookHandler('https://some-slack-webhook.url', {
    level: 'critical'
  }))

logger.debug("I'm going nowhere. :(")
logger.info("I'm going to the log file.")
logger.emergency("I'm going to the log file and to the slack channel!")
```

## Features

- **🎾 Flexible:** The basic logging infrastructure and the log-writing mechanisms are completely [decoupled and extensible](#concepts).
- **🌌 Universal:** Livy was created for Node.js, but most components work [in the browser](#usage-in-browsers) just as well.
- **⌨️ Great IDE support:** Livy is written in TypeScript for great auto completion and easier bug spotting.
- **⚓️ Stable:** Livy has a [comprehensive test suite](https://codecov.io/gh/loilo/livy).

---

<details>
  <summary><strong>Table of Contents</strong></summary>

- [Installation](#installation)
- [Get Started](#get-started)
- [Concepts](#concepts)
- [Components](#components)
- [Contributing](#contributing)
- [To Do](#to-do)
- [Credit](#credit)

</details>

---

## Installation

Install the logger factory from npm:

```bash
npm install @livy/logger
```

## Get Started

Once you've installed the [`@livy/logger`](packages/logger/README.md#readme) package. This package only contains the overall structure of the logger but no concrete logging functionality — those are installed separately as _components_.

So now think about how your logging should go. Want to write errors to a log file? Install the [`@livy/file-handler`](packages/file-handler/README.md#readme) and set up your logger:

```js
const { createLogger } = require('@livy/logger')
const { FileHandler } = require('@livy/file-handler')

const logger = createLogger('app-logger', {
  handlers: [new FileHandler('error.log', { level: 'error' })]
})
```

That's it, you can start using the `logger` instance:

```js
logger.error('Something went wrong!', { location: 'main.js:50' })
```

And there you go!

**Learn more:**

- [Logger](packages/logger/README.md#readme): Learn more about how to config the logger factory.
- [Handlers](#handlers-1): See what handlers are available besides writing to a file.
- [Concepts](#concepts): Learn about the core concepts of Livy.

## Concepts

Most of Livy's concepts (and, in fact, a lot of its source code as well) are borrowed from the Monolog library. There are some differences to make it fit nicely into the JavaScript world, but if you're coming from the PHP Monolog world, you're probably pretty familiar with how things work in Livy.

Most importantly, Livy adheres to the log levels defined in [RFC 5424](https://tools.ietf.org/html/rfc5424) and offers a logger interface compatible with [PSR-3](https://www.php-fig.org/psr/psr-3/). This also means that you may use Livy to visualize PSR-3 compatible PHP logs in the browser. For this use case, take a look at the [BrowserConsoleHandler](packages/browser-console-handler/README.md#readme) and the [DomHandler](packages/dom-handler/README.md#readme).

### Log Levels

The log levels Livy uses are those defined in [the syslog protocol](https://tools.ietf.org/html/rfc5424), which are:

<!-- prettier-ignore -->
Level | Severity | Description | Examples
-|-|-|-
`debug` | 7 | Detailed debug information |
`info` | 6 | Interesting events | User logs in, SQL logs
`notice` | 5 | Normal but significant events |
`warning` | 4 | Exceptional occurrences that are not errors | Use of deprecated APIs, poor use of an API, undesirable things that are not necessarily wrong
`error` | 3 | Runtime errors that do not require immediate action but should typically be logged and monitored |
`critical` | 2 | Critical conditions | Application component unavailable, unexpected exception
`alert` | 1 | Action must be taken immediately | Entire website down, database unavailable, etc. This should trigger the SMS alerts and wake you up.
`emergency` | 0 | System is unusable |

### Handlers

Handlers are the core unit of Livy. A handler is an entity which receives [log records](#log-records) and, if it is responsible, dispenses them towards some target (for example a file). Without a handler, a logger just does nothing.

Each logger can have an arbitrary amount of handlers. They can be added through the `handlers` [set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set):

<!-- prettier-ignore -->
```js
logger.handlers
  .add(new FileHandler('livy.log'))
  .add(new ConsoleHandler())
```

Note that handlers attached to a logger are used as a stack. That means that, when logging something, handlers are executed in reversed insertion order. This allows to add temporary handlers to a logger which can prevent further handlers from being executed.

### Formatters

It's the job of formatters to turn [log records](#log-records) into strings of all sorts — plain text, HTML, CSV, JSON, you name it.

Formatters are used by most handlers and can be injected through their options:

```js
const { JsonFormatter } = require('@livy/json-formatter')

// Make the file handler write newline-delimited JSON files
const fileHandler = new FileHandler('/var/log/livy.log', {
  formatter: new JsonFormatter()
})

// You may also set the formatter afterwards:
fileHandler.formatter = new JsonFormatter()
```

All handlers that accept an optional formatter also have a default formatter which is available at `handler.defaultFormatter`.

### Processors

Processors take a [log record](#log-records) and modify it. This usually means that they add some metadata to the record's `extra` property.

A processor can be added to a logger directly (and is subsequently applied to log records before they reach any handler), but many handlers support handler-specific processors as well. In both cases, processors are accessed via the `processors` [set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set):

```js
logger.processors.add(record => {
  record.extra.easter_egg = '🐣'
  return record
})
```

### Log Records

The log record is an internal concept that you'll mostly only need to understand if you intend to write your own handlers/formatters/loggers.

Explained by example: When having this logger...

```js
const logger = require('@livy/logger').createLogger('app-logger')
```

...then calling a log method like this...

```js
logger.debug('Hello World!', { from: 'Germany' })
```

...would internally create this object:

```js
{
  level: 'debug',
  severity: 7,
  message: 'Hello World!',
  context: { from: 'Germany' },
  extra: {}, // Any extra data, usually attached by processors
  channel: 'app-logger'
  datetime: {...} // A Luxon DateTime object of the current date and time
}
```

That object above is an example of a log record. Log records are passed around many places and if you're not writing your own [components](#components), you can just ignore their existence most of the time.

However, for some components it's useful knowing the concept of log records to understand how the component can be configured.

Take the very basic [`LineFormatter`](packages/line-formatter/README.md#readme): It allows you to specify an `include` option which is nothing but an object telling the formatter which properties of the log record to include in the output:

```js
const { createLogger } = require('@livy/logger')
const { ConsoleHandler } = require('@livy/console-handler')
const { LineFormatter } = require('@livy/line-formatter')

const logger = createLogger('app-logger', {
  handlers: [
    new ConsoleHandler({
      formatter: new LineFormatter({
        include: { datetime: false, context: false }
      })
    })
  ]
})

logger.debug('Hello World!')
// Prints: DEBUG Hello World!
```

### Bubbling

[Handlers](#handlers) may indicate that they completely handled the current log record with no need for further handlers in the logger to take action. They do so by returning `Promise<true>` from the `handle` method (or `true` from `handleSync`, respectively).

Because handlers usually don't interact with each other, bubbling prevention is rather exceptional. Most handlers will only do it if you explicitly instruct them to do so (by setting the `bubble` option to `true`) with some notable exceptions (e.g. the [`NullHandler`](packages/null-handler/README.md#readme) which always prevents bubbling after handling a log record).

Since handlers operate as a stack (as explained in the [handlers](#handlers) section), the concept of bubbling allows for easy temporary overriding of a logger's behavior. You may, for example, make a `logger` ignore all its configured handlers and only log to the terminal by doing this:

```js
const { ConsoleHandler } = require('@livy/console-handler')

logger.handlers.add(new ConsoleHandler({ bubble: false }))
```

### Synchronous and Asynchronous Logging

A logger is often run in many different (synchronous and asynchronous) contexts. Therefore, Livy allows handlers to implement both a synchronous and an asynchronous way to do their jobs and tries to invoke them appropriately. However, since Node.js is an inherently concurrent environment, there are cases where a synchronous way is simply not available (especially for anything network-related).

That's why by default, Livy runs in so-called "mixed mode". That is: handlers are instructed to do their work synchronously wherever possible, but asynchronous actions are allowed as well. However, this behavior comes with a grave tradeoff: Since the logger cannot wait for asynchronous handlers to finish their work, it has no insight into the bubbling behavior intended by asynchronous handlers or whether or not they even completed successfully.

Mixed mode therefore certainly is a suboptimal way to run Livy and you may want to use one of the more clear-cut alternatives: sync mode or async mode. Both modes do have the advantage that they properly invoke all their handlers in-order and handle their errors, but of course these modes have tradeoffs as well:

#### Sync Mode

You can create a sync mode logger by setting the factory's `mode` option to `"sync"`:

```js
const { createLogger } = require('@livy/logger')
const { SlackWebhookHandler } = require('@livy/slack-webhook-handler')

const logger = createLogger('app-logger', {
  mode: 'sync'
})

// This will throw an error:
logger.handlers.add(new SlackWebhookHandler('https://some-slack-webhook.url'))
```

`SlackWebhookHandler` is an exclusively asynchronous handler and can not be used in a synchronous environment. This is the tradeoff of a synchronous handler.

Therefore, sync mode is recommended if you have no need for exclusively asynchronous handlers.

#### Async Mode

You can create a fully async mode logger by setting the factory's `mode` option to `"async"`:

```js
const { createLogger } = require('@livy/logger')

const logger = createLogger('app-logger', {
  mode: 'async'
})
```

This allows any handler to be used with the logger. However, you now have to `await` every logging action you perform:

```js
// This is correct:
await logger.debug('foo')
await logger.info('bar')

// This is correct as well:
logger.debug('foo').then(() => logger.info('bar'))

// This is incorrect:
logger.debug('foo')
logger.info('bar')

// Oops! Now we have no guarantee that handlers of the "foo" log *actually* ran before the "bar" log.
```

This is the tradeoff of asynchronous handlers: You'll have to use highly contagious `async`/`await` constructs or any other way to handle the [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) returned by an asynchronous logger, which might be undesirable in your codebase.

To sum up: Use async mode if all places where the logger is used can afford to be asynchronous.

### Usage in Browsers

Many Livy components work in the browser. Some are even [explicitely created](#browser) for a browser environment.

However, please take notice that these components still use a Node.js-style module format which is not natively supported by browsers. You'll need a bundler like [Parcel](https://parceljs.org/), [Webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org/) or [Browserify](http://browserify.org/) to make them browser-ready.

Alternatively, you can use a CDN like [Pika](https://www.pika.dev/search?q=%40livy) to try out Livy without using npm.

## Components

These are the components (handlers, formatters, processors) officially maintained by the Livy team. They are not "included" in Livy because each component we provide each resides in a separate package. This makes them a little more cumbersome to install, but it helps us properly decoupling our code and keeps your `node_modules` folder a whole lot cleaner.

> Our components library is by far not as comprehensive as that of Monolog. If you're missing any component, feel free to open an issue and explain your use case!

### Handlers

> [What are handlers?](#handlers)

#### Write to Screen or Files

- [ConsoleHandler](packages/console-handler/README.md#readme): Writes log records to a terminal console.
- [FileHandler](packages/file-handler/README.md#readme): Writes log records to a file.
- [RotatingFileHandler](packages/rotating-file-handler/README.md#readme): Stores log records to files which are rotated by date/time or file size. Discards oldest files when a certain configured number of maximum files is exceeded.

#### Network

- [HttpHandler](packages/http-handler/README.md#readme): Send log records to an HTTP(S) endpoint.
- [SendmailHandler](packages/sendmail-handler/README.md#readme): Dispenses log records via email.
- [SlackWebhookHandler](packages/slack-webhook-handler/README.md#readme): Sends log records to Slack through notifications.
- [SocketIOHandler](packages/socket.io-handler/README.md#readme): Sends log records to a Socket.IO server.
- [WebSocketHandler](packages/websocket-handler/README.md#readme): Sends log records to a WebSocket. This allows for easy passing of log records from a browser to a backend.

#### Browser

- [BrowserConsoleHandler](packages/browser-console-handler/README.md#readme): Writes log records to a browser console.
- [DomHandler](packages/dom-handler/README.md#readme): Writes log records to the DOM.

#### Utility

- [ArrayHandler](packages/array-handler/README.md#readme): Pushes log records to an array.
- [NoopHandler](packages/noop-handler/README.md#readme): Handles anything by doing nothing and does not prevent other handlers from being applied. This can be used for testing.
- [NullHandler](packages/null-handler/README.md#readme): Does nothing and prevents other handlers in the stack to be applied. This can be used to put on top of an existing handler stack to disable it temporarily.

#### Wrappers

Wrappers are a special kind of handler. They don't dispense log records themselves but they modify the behavior of the handler(s) they contain.

- [FilterHandler](packages/filter-handler/README.md#readme): Restrict which log records are passed to the wrapped handler based on a test callback.
- [GroupHandler](packages/group-handler/README.md#readme): Distribute log records to multiple handlers.
- [LevelFilterHandler](packages/level-filter-handler/README.md#readme): Restrict which log records are passed to the wrapped handler based on a minimum and maximum level.
- [RestrainHandler](packages/restrain-handler/README.md#readme): Buffers all records until an activation condition is met, in which case it flushes the buffer to its wrapped handler.

### Formatters

> [What are formatters?](#formatters)

- [AnsiLineFormatter](packages/ansi-line-formatter/README.md#readme): Formats a log record into a terminal-highlighted, one-line string.
- [ConsoleFormatter](packages/console-formatter/README.md#readme): Formats a log record into a terminal-highlighted, human-readable multiline string.
- [CsvFormatter](packages/csv-formatter/README.md#readme): Formats a log record into a CSV line.
- [HtmlOnelineFormatter](packages/html-oneline-formatter/README.md#readme): Formats a log record into a one-line HTML line.
- [HtmlPrettyFormatter](packages/html-pretty-formatter/README.md#readme): Formats a log record into a comprehensive, human-readable HTML string.
- [JsonFormatter](packages/json-formatter/README.md#readme): Encodes a log record as JSON.
- [LineFormatter](packages/line-formatter/README.md#readme): Formats a log record into a one-line string.

### Processors

> [What are processors?](#processors)

- [HostnameProcessor](packages/hostname-processor/README.md#readme): Adds the running machine's hostname to a log record.
- [MemoryUsageProcessor](packages/memory-usage-processor/README.md#readme): Adds the current memory usage to a log record.
- [ProcessIdProcessor](packages/process-id-processor/README.md#readme): Adds the process ID to a log record.
- [TagsProcessor](packages/tags-processor/README.md#readme): Adds a set of predefined tags to a log record.
- [UidProcessor](packages/uid-processor/README.md#readme): Adds a unique-per-instance identifier to a log record.

## Contributing

When contributing code, please consider the following things:

- [ ] Make sure `yarn test` passes.
- [ ] Add tests for new features or for bug fixes that have not previously been caught by tests.
- [ ] Use [imperative mood](https://en.wikipedia.org/wiki/Imperative_mood) for commit messages and function doc blocks.
- [ ] Add doc blocks to interfaces, classes, methods and public properties.
  - You may consider omitting them for constructors or for interfaces whose purpose is very obvious (e.g. a `MyThingOptions` interface next to a `MyThing` class).
  - Parameter descriptions of function doc blocks should be aligned:
    ```ts
    /**
     * @param bar           This description is indented very far
     * @param longParameter just to be aligned with this description.
     */
    function foo(bar: number, longParameter: string) {}
    ```
  - Return annotations are only needed where the function's description does not make it obvious what's returned.

## To Do

- Find a good alternative for [Luxon](https://moment.github.io/luxon/) to support timezone-related record timestamps. Luxon is great, but it's pretty heavyweight for a core dependency just doing date handling in a library that is potentially run in the browser.
- Native Node.js ES module support is not ready yet. While there are compiled `.mjs` files, this will only work once all dependencies (and first and foremost Luxon as the only core dependency) support them. There's also some minor tweaking to do to get OS-specific EOL characters to function correctly which might require support for [top-level await](https://github.com/tc39/proposal-top-level-await#readme) in Node.js.

## Credit

- [Monolog](https://github.com/seldaek/monolog): They did all the hard conceptual work and battle testing, also a lot of source code and documentation is directly taken from there.
- Logo: The scroll icon is based on an illustration by [Smashicons](https://www.flaticon.com/authors/smashicons) from [www.flaticon.com](https://www.flaticon.com) (licensed under [Flaticon Basic License](https://file000.flaticon.com/downloads/license/license.pdf)).
