import { describe, expect, test } from 'vitest'
import * as environment from '../src/environment'

describe('@livy/util/lib/environment', () => {
  test('isNodeJs', () => {
    expect(environment.isNodeJs).toBe(true)
  })

  test('isBrowser', () => {
    expect(environment.isBrowser).toBe(false)
  })

  test('EOL', () => {
    expect(environment.EOL).toBe('\n')
  })
})
