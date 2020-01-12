import { LogRecord } from '@livy/contracts/lib/log-record'

export type IncludedRecordProperties = { [P in keyof LogRecord]: boolean }
