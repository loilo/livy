/**
 * Check whether the current runtime is Node.js
 */
export const isNodeJs =
  typeof process !== 'undefined' &&
  typeof process.release === 'object' &&
  process.release.name === 'node'

/**
 * Check whether the current runtime is a browser (or JSDOM)
 */
export const isBrowser =
  typeof self === 'object' &&
  self !== null &&
  self.self === self &&
  typeof self.navigator === 'object'

/**
 * The appropriate line ending character(s) to use
 */
export const EOL = isNodeJs ? (require('os').EOL as string) : '\n'
