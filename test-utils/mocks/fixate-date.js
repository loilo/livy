/**
 * Fixates JavaScript's Date
 * This is useful for snapshot testing data which refers to the current time.
 *
 * Losely based on https://github.com/facebook/jest/issues/2234#issuecomment-324868057
 *
 * ATTENTION: Fixated dates do not play well with Luxon!
 * Dates must be fixated *after* any DateTimes for records have been created.
 * This means either run record() after fixate() or create a record factory in advance via record.with()
 */

/**
 * Keep a reference to the original date
 */
const OriginalDate = Date

/**
 * Globally fixate the JavaScript datetime
 *
 * @param  {...any} fixedDateArgs The fixed arguments passed to the Date constructor
 *
 * @example
 * fixate(2019, 0, 1) // Fixate date to January 1, 2019, 00:00:00.000 of local time
 * fixate('2015-08-15T14:30:00+02:00') // Fixate date to August 15, 2015, 14:30:00.000 of CEST
 */
export function fixate(...fixedDateArgs) {
  // eslint-disable-next-line no-global-assign
  Date = class extends OriginalDate {
    constructor() {
      return new OriginalDate(...fixedDateArgs)
    }
  }

  Date.now = () => new Date().getTime()
}

/**
 * Release the previously fixated datetime
 * You probably want to call this in afterEach()
 *
 * @example
 * release()
 */
export function release() {
  // eslint-disable-next-line no-global-assign
  Date = OriginalDate
}
