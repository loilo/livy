import type { LogRecord } from '@livy/contracts'

export type IncludedRecordProperties = { [P in keyof LogRecord]: boolean }
