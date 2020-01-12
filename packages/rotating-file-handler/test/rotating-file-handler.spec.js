jest.mock('fs')
jest.mock('os')

const { DateTime } = require('luxon')

// Fixate timezone for file names to the test constant
jest.mock('../src/max-age-strategy', () => {
  const { MaxAgeStrategy } = jest.requireActual('../src/max-age-strategy')

  return {
    MaxAgeStrategy: class extends MaxAgeStrategy {
      getStartOfDurationUnit() {
        return super.getStartOfDurationUnit().setZone(TEST_CONSTANTS.TIMEZONE)
      }
    }
  }
})

const { RotatingFileHandler } = require('../src/rotating-file-handler')

const fs = require('fs')

/**
 * Write a number of records to a handler at a fixated date
 *
 * @param {HandlerInterface} handler The handler to write to
 * @param {'sync'|'async'}   mode    Whether to use `handle` and continue or `handleAsync` and await
 * @param {string}           isoDate The fixated date as an ISO 8601 string
 * @param {string[]}         levels  An array of log levels that will be mapped to invoked records
 */
async function writeRecords(handler, mode, isoDate, levels) {
  const createRecord = record.with({
    datetime: DateTime.fromISO(isoDate).setZone(TEST_CONSTANTS.TIMEZONE),
    message: 'Test RotatingFileHandler'
  })
  const records = levels.map(level => createRecord({ level }))

  luxon.fixate(isoDate)
  for (const record of records) {
    if (mode === 'sync') {
      handler.handleSync(record)
    } else {
      await handler.handle(record)
    }
  }
  luxon.release()
}

describe('@livy/rotating-file-handler', () => {
  afterEach(() => {
    date.release()
    fs.__reset()
  })

  it('should use daily rotation with default settings', () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt')

    const handle = writeRecords.bind(null, handler, 'sync')
    handle('2015-08-15T14:30:00+02:00', ['debug', 'info'])
    handle('2015-08-16T05:12:21+02:00', ['notice', 'warning'])
    handle('2015-08-16T13:13:13+02:00', ['error', 'critical'])
    handle('2015-08-17T13:13:13+02:00', ['alert', 'emergency'])

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should use daily rotation with default settings (async)', async () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt')

    const handle = writeRecords.bind(null, handler, 'async')
    await handle('2015-08-15T14:30:00+02:00', ['debug', 'info'])
    await handle('2015-08-16T05:12:21+02:00', ['notice', 'warning'])
    await handle('2015-08-16T13:13:13+02:00', ['error', 'critical'])
    await handle('2015-08-17T13:13:13+02:00', ['alert', 'emergency'])

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should rotate on handler close', () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      maxFiles: 1
    })

    writeRecords(handler, 'sync', '2015-08-15T14:30:00+02:00', ['debug'])

    date.fixate('2015-08-16T05:12:21+02:00')

    handler.close()

    const files = fs.toJSON()
    expect(files).toBeObject()
    expect(Object.keys(files)).toHaveLength(0)
  })

  it('should perform max-age rotation minutely', () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      threshold: 'minute'
    })

    const handle = writeRecords.bind(null, handler, 'sync')

    handle('2015-08-15T14:30:00+02:00', ['debug', 'info'])
    handle('2015-08-16T05:12:21+02:00', ['notice', 'warning'])
    handle('2015-08-16T05:12:59+02:00', ['error', 'critical'])
    handle('2015-08-16T13:13:13+02:00', ['alert', 'emergency'])

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should perform max-age rotation hourly', () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      threshold: 'hour'
    })

    const handle = writeRecords.bind(null, handler, 'sync')

    handle('2015-08-15T14:30:00+02:00', ['debug', 'info'])
    handle('2015-08-16T05:12:21+02:00', ['notice', 'warning'])
    handle('2015-08-16T05:12:59+02:00', ['error', 'critical'])
    handle('2015-08-16T13:13:13+02:00', ['alert', 'emergency'])

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should perform max-age rotation daily', () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      threshold: 'day'
    })

    const handle = writeRecords.bind(null, handler, 'sync')

    handle('2015-08-15T14:30:00+02:00', ['debug', 'info'])
    handle('2015-08-16T05:12:21+02:00', ['notice', 'warning'])
    handle('2015-08-16T05:12:59+02:00', ['error', 'critical'])
    handle('2015-08-16T13:13:13+02:00', ['alert', 'emergency'])

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should perform max-age rotation monthly', () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      threshold: 'month'
    })

    const handle = writeRecords.bind(null, handler, 'sync')

    handle('2015-08-15T14:30:00+02:00', ['debug', 'info'])
    handle('2015-08-16T05:12:21+02:00', ['notice', 'warning'])
    handle('2015-09-02T05:12:59+02:00', ['error', 'critical'])
    handle('2016-01-16T13:13:13+02:00', ['alert', 'emergency'])

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should perform max-age rotation yearly', () => {
    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      threshold: 'year'
    })

    const handle = writeRecords.bind(null, handler, 'sync')

    handle('2015-08-15T14:30:00+02:00', ['debug', 'info'])
    handle('2015-08-16T05:12:21+02:00', ['notice', 'warning'])
    handle('2016-09-02T05:12:59+02:00', ['error', 'critical'])
    handle('2017-01-16T13:13:13+02:00', ['alert', 'emergency'])

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should do max-size rotation', () => {
    const handler = new RotatingFileHandler('/logfile%appendix%.txt', {
      strategy: 'max-size',
      threshold: '100 Bytes'
    })

    handler.handleSync(record('debug', 'Test RotatingFileHandler'))
    handler.handleSync(record('info', 'Test RotatingFileHandler'))
    handler.handleSync(record('notice', 'Test RotatingFileHandler'))
    handler.handleSync(record('warning', 'Test RotatingFileHandler'))
    handler.handleSync(record('error', 'Test RotatingFileHandler'))

    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should not accept a non-existent directory', () => {
    expect(() => {
      new RotatingFileHandler('/invalid/logfile-%date%.txt')
    }).toThrowError(
      new Error('Directory for rotating log files "/invalid" does not exist')
    )
  })

  it('should not accept an invalid rotation strategy', () => {
    expect(() => {
      new RotatingFileHandler('/logfile.txt', {
        strategy: 'invalid'
      })
    }).toThrowError(new Error('Invalid rotation strategy "invalid"'))
  })

  it('should require a %date% token in max-age rotation', () => {
    expect(() => {
      new RotatingFileHandler('/logfile.txt', {
        strategy: 'max-age'
      })
    }).toThrowError(
      new Error(
        'Invalid filename template "logfile.txt", must contain the %date% token.'
      )
    )
  })

  it('should require a %appendix% token in max-size rotation', () => {
    expect(() => {
      new RotatingFileHandler('/logfile.txt', {
        strategy: 'max-size'
      })
    }).toThrowError(
      new Error(
        'Invalid filename template "logfile.txt", must contain the %appendix% token.'
      )
    )
  })

  it('should ignore a %date% token in the directory', () => {
    fs.mkdirSync('/%date%')

    expect(() => {
      new RotatingFileHandler('/%date%/logfile.txt', {
        strategy: 'max-age'
      })
    }).toThrowError(
      new Error(
        'Invalid filename template "logfile.txt", must contain the %date% token.'
      )
    )
  })

  it('should ignore an %appendix% token in the directory', () => {
    fs.mkdirSync('/%appendix%')

    expect(() => {
      new RotatingFileHandler('/logfile.txt', {
        strategy: 'max-size'
      })
    }).toThrowError(
      new Error(
        'Invalid filename template "logfile.txt", must contain the %appendix% token.'
      )
    )
  })

  it('should respect the "formatter" option', () => {
    const createRecord = record.with({
      level: 'info',
      message: '',
      datetime: DateTime.fromISO(TEST_CONSTANTS.DATE_ISO).setZone(
        TEST_CONSTANTS.TIMEZONE
      )
    })
    date.fixate(TEST_CONSTANTS.DATE_ISO)

    const formatter = new MockFormatter()

    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      formatter
    })

    handler.handleSync(createRecord())

    expect(handler.formatter).toBe(formatter)
    expect(formatter.format).toHaveBeenCalledTimes(2)
    expect(formatter.format).toHaveBeenLastCalledWith(createRecord())
  })

  it('should respect the "level" option', () => {
    const createRecord = record.with({
      message: '',
      datetime: DateTime.fromISO(TEST_CONSTANTS.DATE_ISO).setZone(
        TEST_CONSTANTS.TIMEZONE
      )
    })
    date.fixate(TEST_CONSTANTS.DATE_ISO)

    const handler = new RotatingFileHandler('/logfile-%date%.txt', {
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()
    handler.handleSync(createRecord({ level: 'info' }))
    handler.handleSync(createRecord({ level: 'notice' }))
    expect(fs.toJSON()).toMatchSnapshot()
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new RotatingFileHandler('/logfile-%date%.txt')
    const nonBubblingHandler = new RotatingFileHandler('/logfile-%date%.txt', {
      bubble: false
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBeFalse()
    expect(nonBubblingHandler.handleSync(record('debug'))).toBeTrue()
  })
})
