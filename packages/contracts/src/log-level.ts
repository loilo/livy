// istanbul ignore file: The contracts ARE the source of truth, testing them would basically be code duplication

/**
 * Log levels as defined by RFC 5424
 */
export const logLevels = [
  'debug',
  'info',
  'notice',
  'warning',
  'error',
  'critical',
  'alert',
  'emergency'
] as const

/**
 * Log level severity as defined by RFC 5424
 */
export const SeverityMap = {
  debug: 7,
  info: 6,
  notice: 5,
  warning: 4,
  error: 3,
  critical: 2,
  alert: 1,
  emergency: 0
} as const

/**
 * Severity level
 */
export type SeverityLevel = typeof SeverityMap[keyof typeof SeverityMap]

/**
 * Log level
 */
export type LogLevel = typeof logLevels[number]
