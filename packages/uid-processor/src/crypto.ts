import * as environment from '@livy/util/environment'

export const crypto = environment.isNodeJs
  ? ((await import('node:crypto')) as Pick<Crypto, 'getRandomValues'>)
  : globalThis.crypto
