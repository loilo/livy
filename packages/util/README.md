# `@livy/util`

This package contains common utilities for building components for the [Livy](../../README.md#readme) logger.

---

**Table of Contents:**

- [General Purpose Utilities](#general-purpose-utilities)
  - [Helpers](#helpers)
  - [Types](#types)
  - [`Environment`](#environment)
  - [`ValidatableSet`](#validatableset)
  - [`GatedSet`](#gatedset)
  - [`HTML`](#html)
  - [`isResettableInterface`](#isresettableinterface)
  - [`Mixin`](#mixin)
  - [`Timer`](#timer)
- [Formatter-Related Utilities](#formatter-related-utilities)
  - [`IncludedRecordProperties`](#includedrecordproperties)
  - [`isFormattableHandlerInterface`](#isformattablehandlerinterface)
  - [`AbstractBatchFormatter`](#abstractbatchformatter)
  - [`LineFomatter`](#linefomatter)
- [Handler-Related Utilities](#handler-related-utilities)
  - [`isClosableHandlerInterface`](#isclosablehandlerinterface)
  - [`isProcessableHandlerInterface`](#isprocessablehandlerinterface)
  - [`isSyncHandlerInterface`](#issynchandlerinterface)
  - [`MirrorSyncHandlerMixin`](#mirrorsynchandlermixin)
  - [`ProcessableHandlerMixin`](#processablehandlermixin)
  - [`RespectLevelMixin`](#respectlevelmixin)
  - [`FormattableHandlerMixin`](#formattablehandlermixin)
  - [`AbstractBatchHandler`](#abstractbatchhandler)
  - [`AbstractLevelBubbleHandler`](#abstractlevelbubblehandler)
  - [`AbstractFormattingProcessingHandler`](#abstractformattingprocessinghandler)

---

## General Purpose Utilities

### [Helpers](src/helpers.ts)

There's also a whole bunch general-purpose helper functions in this file. They are thoroughly documented, including examples, so you're probably best off to just dive into the source code.

### [Types](src/types.ts)

For TypeScript users, there are also some handy types to be found in this file.

### [`Environment`](src/environment.ts)

Determines whether the runtime is Node.js or a browser and derives related environment-specific data.

```js
const Environment = require('@livy/util/lib/environment')

Environment.isNodeJs // `true` or `false`
Environment.isBrowser // `true` or `false`
Environment.EOL // os.EOL in Node.js, '\n' otherwise
```

### [`ValidatableSet`](src/validatable-set.ts)

An extended [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) with the array methods [`some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some) and [`every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) on top:

<!-- prettier-ignore -->
```js
const { ValidatableSet } = require('@livy/util/lib/validatable-set')

const set = new ValidatableSet([1, 2, 3])

set.every(item => typeof item === 'number') // true
set.some(item => item < 0)                  // false

// Behaves like the corresponding array methods on empty sets:
set.clear()
set.every(anyCondition) // false
set.some(anyCondition)  // true
```

### [`GatedSet`](src/gated-set.ts)

An extended [`ValidatableSet`](#validatableset) that allows to validate and reject values that go inside the set.

<!-- prettier-ignore -->
```js
const { GatedSet } = require('@livy/util/lib/gated-set')

const integers = new GatedSet(value => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new TypeError('Set only accepts integers')
  }
})

integers.add(5)     // OK
integers.add(-50)   // OK
integers.add(5.5)   // Throws TypeError
integers.add(NaN)   // Throws TypeError
integers.add('foo') // Throws TypeError
```

### [`HTML`](src/html.ts)

A function/template tag that allows you to easily construct HTML strings without having to worry about escaping:

```js
const { HTML } = require('@livy/util/lib/html')

const snippet = '<em>awesome</em>'

HTML`<p>Markup is ${snippet}!</p>`.toString()
// '<p>Markup is &lt;em&gt;awesome&lt;/em&gt;!</p>'

// Use HTML as template tag in interpolations to avoid escaping:
HTML`<p>Markup is ${HTML`<em>awesome</em>`}!</p>`.toString()
// '<p>Markup is <em>awesome</em>!</p>'

// Use HTML as a function to avoid escaping of variables:
HTML`<p>Markup is ${HTML(snippet)}!</p>`.toString()
// '<p>Markup is <em>awesome</em>!</p>'
```

### [`isResettableInterface`](src/is-resettable-interface.ts)

Check whether a handler or processors is resettable.

> See also: [`ResettableInterface`](../contracts/README.md#resettableinterface)

### [`Mixin`](src/mixin.ts)

An approach to use TypeScript mixins slightly altered from [Mixin classes](https://mariusschulz.com/blog/mixin-classes-in-typescript).

Supports extending abstract classes and correctly type-checks `super()` calls for the tradeoff of having to wrap the mixin in an additional function call:

```ts
// Mixin definition:
const WriteAccess = Mixin(
  _ =>
    class extends _ {
      write(file: string, content: string) {
        // Do some write action
      }
    }
)

// Mixin usage:
class User {
  constructor(protected name: string) {}
}

class PrivilegedUser extends WriteAccess(User) {
  constructor(name: string, protected role: 'editor' | 'admin') {
    super(name) // <- type-hinted!
  }

  otherMethod() {
    this.write('/some/file/path', 'some content') // <- type-hinted!
  }
}
```

### [`Timer`](src/timer.ts)

A cross-runtime performance timer implementation:

```js
const { Timer } = require('@livy/util/lib/timer')

const timer = new Timer()

// Start the timer
timer.start()

// ... do some work ...

// Get number of milliseconds elapsed since timer.start()
timer.get()

// ... do some work ...

// Still get number of milliseconds elapsed since timer.start()
timer.get()

// Stop and reset the timer
timer.reset()
```

## Formatter-Related Utilities

### [`IncludedRecordProperties`](src/formatters/included-record-properties.ts)

A simple TypeScript type which represents an object with all [`LogRecord`](../../README.md#log-records) properties mapped to boolean values.

This can be useful as type of a formatter's option that determines which parts of a log record should be represented in the formatted output — see for example the [`LineFormatter`](src/formatters/line-formatter.ts) implementation.

### [`AbstractBatchFormatter`](src/formatters/abstract-batch-formatter.ts)

A base class for formatters to extend which implements `formatBatch` as a series of `format` calls, joined by a delimiter (which by default is the `EOL` determined by the [environment](#Environment), can be changed by overriding the `batchDelimiter` property):

```js
const { AbstractBatchFormatter } = require('@livy/util/lib/abstract-batch-formatter')

class QuestionableFormatter extends AbstractBatchFormatter {
  format(record) {
    return '?'
  }
}

const q = new QuestionableFormatter()
q.format({ ... }) // '?'
q.formatBatch([{ ... }, { ... }, { ... }]) // '?\n?\n?'
```

> See also: [`FormatterInterface`](../contracts/README.md#formatterinterface)

### [`LineFomatter`](src/formatters/line-formatter.ts)

This formatter — because it's very ubiquitous throughout the project — is implemented here to remove complexity from the dependency graph (i.e. to avoid a mutual dependency with `@livy/line-formatter`).

See [`@livy/line-formatter`](../line-formatter#readme) for documentation.

## Handler-Related Utilities

This includes various base classes, mixins and check functions for implementing handlers.

### [`isClosableHandlerInterface`](src/handlers/is-closable-handler-interface.ts)

Check whether a handler is [closable](../contracts/README.md#closablehandlerinterface).

### [`isFormattableHandlerInterface`](src/handlers/is-formattable-handler-interface.ts)

Checks whether a handler implements the [`FormattableHandlerInterface`](../contracts/README.md#formattablehandlerinterface)

### [`isProcessableHandlerInterface`](src/handlers/is-processable-handler-interface.ts)

Check whether a handler can [use processors](../contracts/README.md#processablehandlerinterface).

### [`isSyncHandlerInterface`](src/handlers/is-sync-handler-interface.ts)

Check whether a handler can be [invoked synchronously](../contracts/README.md#handlerinterface).

### [`MirrorSyncHandlerMixin`](src/handlers/mirror-sync-handler-mixin.ts)

Implements the mandatory asynchronous handler methods `handle` and `handleBatch` by replicating the behavior of their corresponding synchronous methods:

<!-- prettier-ignore -->
```js
const SomeBaseClass = require('SomeBaseClass')
const {
  MirrorSyncHandlerMixin
} = require('@livy/util/lib/handlers/mirror-sync-handler-mixin')

class Handler extends MirrorSyncHandlerMixin(SomeBaseClass) {
  handleSync(record) {
    // ...
  }

  handleBatchSync(record) {
    // ...
  }
}

const handler = new Handler()
handler.handle()      // calls handler.handleSync()
handler.handleBatch() // calls handler.handleBatchSync()
```

> See also: [`SyncHandlerInterface`](../contracts/README.md#handlerinterface)

### [`ProcessableHandlerMixin`](src/handlers/processable-handler-mixin.ts)

Makes a handler able to work with processors, implementing the [`ProcessableHandlerInterface`](../contracts/README.md#processablehandlerinterface).

It adds:

- a public `processors` [set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
- an internal `processRecord` method which your handler may call with a [log record](../contracts/README.md#logrecord) to run all registered processors on it.
- an internal `resetProcessors` method which resets all resettable processors.
- a basic `reset` method which calls `resetProcessors`, thus making the handler [resettable](#isresettableinterface)

### [`RespectLevelMixin`](src/handlers/respect-level-mixin.ts)

Adds a public `level` property which defaults to `'debug'`, as well as a `isHandling`
implementation based on that level.

> See also: [`HandlerInterface`](../contracts/README.md#handlerinterface)

### [`FormattableHandlerMixin`](src/handlers/formattable-handler-mixin.ts)

Adds a `formatter` property to the applied-to class with support for an implicit default formatter:

```js
const SomeBaseClass = require('SomeBaseClass')
const SomeFormatter = require('SomeFormatter')
const {
  FormattableHandlerMixin
} = require('@livy/util/lib/handlers/formattable-handler-mixin')

class Handler extends FormattableHandlerMixin(SomeBaseClass) {
  /**
   * Allow setting a formatter through a handler option
   */
  constructor({ formatter, ...options }) {
    // Pass other options up
    super(options)

    // Set the `this.explicitFormatter` property.
    // If the user provides no `formatter` option, it will be undefined
    // and `this.formatter` will return the default formatter
    this.explicitFormatter = formatter
  }

  /**
   * Define the default formatter (required)
   */
  get defaultFormatter() {
    return new SomeFormatter()
  }

  handle(record) {
    // ...
  }
}
```

> See also: [`FormattableHandlerInterface`](../contracts/README.md#formattablehandlerinterface)

### [`AbstractBatchHandler`](src/handlers/abstract-batch-handler.ts)

This is a base handler class that implements the `handleBatch` and `handleBatchSync` methods by sequentially executing `handle`/`handleSync` for each passed record.

> See also: [`HandlerInterface`](../contracts/README.md#handlerinterface)

### [`AbstractLevelBubbleHandler`](src/handlers/abstract-level-bubble-handler.ts)

Base handler class (extending the [`AbstractBatchHandler`](#abstractbatchhandler)) which adds a `level` and a `bubble` option and implements the `isHandling` method based on the configured level:

```js
const {
  AbstractLevelBubbleHandler
} = require('@livy/util/lib/handlers/abstract-level-bubble-handler')

class Handler extends AbstractLevelBubbleHandler {
  handle(record) {
    // ...do something with the record...

    // Indicate bubbling behavior based on the `bubble` option:
    return !this.bubble
  }
}
```

See also:

- [Bubbling](../../README.md#bubbling)
- [`HandlerInterface`](../contracts/README.md#handlerinterface)
- [`SyncHandlerInterface`](../contracts/README.md#handlerinterface)

### [`AbstractFormattingProcessingHandler`](src/handlers/abstract-formatting-processing-handler.ts)

Base handler class extending the [`AbstractLevelBubbleHandler`](#abstractlevelbubblehandler) with the [`FormattableHandlerMixin`](#formattablehandlermixin) and [`ProcessableHandlerMixin`](#processablehandlermixin). It completely abstracts the nitty gritty details of writing a handler with formatter and processor support away from you so you only have to implement a `write` method:

```js
const {
  AbstractFormattingProcessingHandler
} = require('@livy/util/lib/handlers/abstract-formatting-processing-handler')

class FileHandler extends AbstractFormattingProcessingHandler {
  async write(record, formattedRecord) {
    await someFileHandler.write(formattedRecord)
  }
}
```

There's also `AbstractSyncFormattingProcessingHandler` to implement a synchronous handler by implementing `writeSync`:

```js
const {
  AbstractSyncFormattingProcessingHandler
} = require('@livy/util/lib/handlers/abstract-formatting-processing-handler')

class SyncFileHandler extends AbstractSyncFormattingProcessingHandler {
  writeSync(record, formattedRecord) {
    someFileHandler.writeSync(formattedRecord)
  }

  // You can still implement your own asynchronous `write` method,
  // but if you omit it, it will just fall back to `writeSync` instead
  async write(record, formattedRecord) {
    await someFileHandler.write(formattedRecord)
  }
}
```
