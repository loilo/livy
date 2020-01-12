# `@livy/contracts`

This package (primarily) contains types representing the [core concepts](../../README.md#concepts) of the [Livy](../../README.md#readme) logger. Those are especially useful when you're building Livy [components](../../README.md#components) using [TypeScript](http://typescriptlang.org). For this reason, code blocks in this documentation are written in TypeScript.

---

**Table of Contents:**

- [`LogLevel`](#loglevel)
- [`LogRecord`](#logrecord)
- [`LoggerInterface`](#loggerinterface)
- [`HandlerInterface`](#handlerinterface)
- [`ResettableInterface`](#resettableinterface)
- [`FormattableHandlerInterface`](#formattablehandlerinterface)
- [`ProcessableHandlerInterface`](#processablehandlerinterface)
- [`ClosableHandlerInterface`](#closablehandlerinterface)
- [`FormatterInterface`](#formatterinterface)
- [`ProcessorInterface`/`ProcessorFunction`](#processorinterfaceprocessorfunction)

---

## [`LogLevel`](src/log-level.ts)

This module contains the available [log levels](../../README.md#log-levels) and their corresponding severities:

- `LogLevel` is a type representing any valid [RFC 5424 log level](https://tools.ietf.org/html/rfc5424#page-11) while `logLevels` is an array containing all those level strings, sorted from least (`debug`) to most serious (`emergency`):

  ```ts
  import { LogLevel, logLevels } from '@livy/contracts/lib/log-level'

  function printLevel(level: LogLevel) {
    if (!logLevels.includes(level)) {
      throw Error('Invalidlog log level')
    }

    console.log(level)
  }
  ```

- The `SeverityLevel` type represents log level severity as an integer from `0` through `7`. The `SeverityMap` object maps log levels to their corresponding severity (`debug → 7, ..., emergency → 0`):

  ```ts
  import { LogLevel, SeverityMap } from '@livy/contracts/lib/log-level'

  /**
   * Sort a list of log levels by severity ("debug" first, "emergency" last)
   */
  function sortBySeverity(levels: LogLevel[]) {
    return [...levels].sort(
      (levelA, levelB) => SeverityMap[levelB] - SeverityMap[levelA]
    )
  }
  ```

## [`LogRecord`](src/log-record.ts)

Exposes the `LogRecord` interface which describes the structure of a Livy log record. This is useful for writing, for example, a custom formatter in TypeScript:

```ts
import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'

class QueryStringFormatter implements FormatterInterface {
  /*
   * Format properties of a record as level=debug&severity=7&message=...
   */
  public format(record: LogRecord) {
    return new URLSearchParams(Object.entries(record)).toString()
  }

  /*
   * Format properties of multiple records as level[]=debug&severity[]=7&message[]=...
   */
  public formatBatch(records: LogRecord[]) {
    return new URLSearchParams(
      records.reduce(
        (carry, record) => [
          ...carry,
          ...Object.entries(record).map(([key, value]) => [`${key}[]`, value])
        ],
        []
      )
    )
      .toString()
      .replace(/%5B%5D/g, '[]')
  }
}
```

## [`LoggerInterface`](src/logger-interface.ts)

Describes the abstract structure of a Livy logger instance (`LoggerInterface`) as well as two variations, `AsyncLoggerInterface` and `SyncLoggerInterface`, which extend `LoggerInterface` and additionally define concrete return types (instead of `unknown`) for the log methods.

```ts
import {
  LoggerInterface,
  AsyncLoggerInterface,
  SyncLoggerInterface
} from '@livy/contracts/lib/logger-interface'
```

## [`HandlerInterface`](src/handler-interface.ts)

Describes the minimum viable structure of a Livy [handler](../../README.md#handlers) as `HandlerInterface`. Additionally, a `SyncHandlerInterface` is provided which represents a handler that has synchronous logging methods in addition to the asynchronous ones.

```ts
import {
  HandlerInterface,
  SyncHandlerInterface
} from '@livy/contracts/lib/handler-interface'
```

## [`ResettableInterface`](src/resettable-interface.ts)

Describes the structure of a resettable handler or processor — a component able to reset its internal state (e.g. the [`ArrayHandler`](../array-handler/README.md#readme) which can clear its own buffer).

```ts
import { ResettableInterface } from '@livy/contracts/lib/resettable-interface'
```

---

Handlers implementing this interface expose a `reset` method to trigger the reset:

```js
const resettableHandler = new SomeResettableHandler()

resettableHandler.reset()
```

Calling this method on a handler should not only reset its own state but also the state of all components attached to it (e.g. processors or wrapped handlers).

## [`FormattableHandlerInterface`](src/formattable-handler-interface.ts)

Describes the structure of a handler which has a configurable [formatter](../../README.md#formatters).

```ts
import { FormattableHandlerInterface } from '@livy/contracts/lib/formattable-handler-interface'
```

## [`ProcessableHandlerInterface`](src/processable-handler-interface.ts)

Describes the structure of a handler with support for [processors](../../README.md#processors).

```ts
import { ProcessableHandlerInterface } from '@livy/contracts/lib/processable-handler-interface'
```

---

Handlers implementing this interface expose a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) of processors as their `processors` property:

<!-- prettier-ignore -->
```js
const processableHandler = new SomeProcessableHandler()

processableHandler.processors
  .add(new SomeProcessor())
  .add(new OtherProcessor())
```

## [`ClosableHandlerInterface`](src/closable-handler-interface.ts)

Describes the structure of a handler which wants to do cleanup tasks when the process exits.

If you want to implement such a handler, please be aware that there is often no spare time left when the `close()` method is invoked (because it is triggered when the process exits/the web page is left), i.e. asynchronous cleanup actions usually won't work.

```ts
import { ClosableHandlerInterface } from '@livy/contracts/lib/closable-handler-interface'
```

## [`FormatterInterface`](src/formatter-interface.ts)

Describes the structure of a [formatter](../../README.md#formatters).

```ts
import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
```

## [`ProcessorInterface`/`ProcessorFunction`](src/processor-interface.ts)

Describes the structure of a [processor](../../README.md#processors).

```ts
import { ProcessorInterfaceOrFunction } from '@livy/contracts/lib/processor-interface'
```

A processor can either be stateless or stateful:

**Stateless Processors**

A stateless processor is just a bare function taking a log record and returning a log record.

```ts
import { ProcessorFunction } from '@livy/contracts/lib/processor-interface'
```

**Stateful Processors**

A stateful processor is a class with a `process` method. That method then does the job of accepting and returning a log record.

```ts
import { ProcessorInterface } from '@livy/contracts/lib/processor-interface'
```

Writing a processor in a stateful is usually done...

- ...if it needs to take options (which are usually taken to the processor's constructor).
- ...if it needs to retain state between several processed records.
