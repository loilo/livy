const { DateTime } = require('luxon')

const SeverityMap = {
  debug: 7,
  info: 6,
  notice: 5,
  warning: 4,
  error: 3,
  critical: 2,
  alert: 1,
  emergency: 0
}

function createRecordFromObject(preset, record) {
  const defaults = {
    channel: 'logs',
    level: undefined,
    message: '',
    context: {},
    extra: {},
    datetime: DateTime.fromISO(TEST_CONSTANTS.DATE_ISO).setZone(
      TEST_CONSTANTS.TIMEZONE
    )
  }

  return {
    ...defaults,
    ...preset,
    ...record,
    get severity() {
      return SeverityMap[this.level]
    }
  }
}

function createRecord(
  level,
  message = '',
  {
    channel = 'logs',
    context = {},
    extra = {},
    datetime = DateTime.fromISO(TEST_CONSTANTS.DATE_ISO).setZone(
      TEST_CONSTANTS.TIMEZONE
    )
  } = {}
) {
  return {
    level,
    get severity() {
      return SeverityMap[this.level]
    },
    message,
    context,
    extra,
    datetime,
    channel
  }
}

createRecord.with = function createRecordBound(preset) {
  return createRecordFromObject.bind(null, preset)
}

module.exports = createRecord
