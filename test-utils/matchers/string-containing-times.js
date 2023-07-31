import { expect } from 'vitest'

expect.extend({
  stringContainingTimes(received, times, string) {
    let pass = true,
      message

    if (typeof string !== 'string') {
      throw new TypeError('Contained value must be a string')
    }

    if (typeof received !== 'string') {
      pass = false
      message = 'Received value is not a string'
    } else {
      const occurrences = received.split(string).length - 1

      if (occurrences !== times) {
        pass = false
        message = `Expected ${JSON.stringify(
          string
        )} to occur ${times} times, found it ${occurrences} times.`
      }
    }

    return this.isNot
      ? {
          pass: !pass,
          message: !pass ? undefined : () => message
        }
      : {
          pass,
          message: pass ? () => message : undefined
        }
  }
})
