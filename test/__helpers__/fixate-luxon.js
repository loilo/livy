/**
 * Fixates JavaScript's Date
 * This is useful for snapshot testing data which refers to the current time.
 */

const luxon = require('luxon')

/**
 * Keep a reference to the original DateTime
 */
const originalDateTime = luxon.DateTime

/**
 * Globally fixate luxon's DateTime
 *
 * @param  {string} isoDate The fixed ISO 8601 date to be returned by DateTime
 *
 * @example
 * fixate('2015-08-15T14:30:00+02:00') // Fixate date to August 15, 2015, 14:30:00.000 of CEST
 */
function fixate(isoDate) {
  const fixatedDateTime = new Proxy(luxon.DateTime.fromISO(isoDate), {
    get(target, key) {
      if (/^set[A-Z].*$/.test(key)) {
        return () => fixatedDateTime
      }

      return target[key]
    }
  })

  luxon.DateTime = new Proxy(luxon.DateTime, {
    get(target, key) {
      if (/^from[A-Z].*$/.test(key) || key === 'local') {
        return () => fixatedDateTime
      }

      return target[key]
    }
  })
}

function release() {
  luxon.DateTime = originalDateTime
}

module.exports = { fixate, release }
