const { ConsoleAdapter } = require('../src/console-adapter')

let logger, console

describe('@livy/util/lib/console-adapter', () => {
  describe('count', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should use "default" as default label', () => {
      console.count()
      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.count', {
        label: 'default',
        count: 1
      })
    })

    it('should accept a label parameter', () => {
      console.count('label')
      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.count', {
        label: 'label',
        count: 1
      })
    })

    it('should increase the counter', () => {
      console.count()
      console.count()

      expect(logger.log).toHaveBeenCalledTimes(2)
      expect(logger.log).toHaveBeenNthCalledWith(1, 'debug', 'console.count', {
        label: 'default',
        count: 1
      })
      expect(logger.log).toHaveBeenNthCalledWith(2, 'debug', 'console.count', {
        label: 'default',
        count: 2
      })
    })
  })

  describe('countReset', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('tolerate non-existing counters', () => {
      expect(() => {
        console.countReset()
      }).not.toThrow()
    })

    it('should reset existing counters', () => {
      console.count()
      console.countReset()
      console.count()

      expect(logger.log).toHaveBeenCalledTimes(2)
      expect(logger.log).toHaveBeenNthCalledWith(1, 'debug', 'console.count', {
        label: 'default',
        count: 1
      })
      expect(logger.log).toHaveBeenNthCalledWith(2, 'debug', 'console.count', {
        label: 'default',
        count: 1
      })
    })
  })

  describe('debug', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass arguments to context.parameters', () => {
      console.debug('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.debug', {
        parameters: ['foo', 'bar', 'baz']
      })
    })
  })

  describe('dir', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass object to context.dir', () => {
      console.dir({
        foo: 1,
        bar: 2
      })

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.dir', {
        dir: {
          foo: 1,
          bar: 2
        }
      })
    })
  })

  describe('dirxml', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass objects to context.dirxml', () => {
      console.dirxml({ foo: 1 }, { bar: 2 })

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.dirxml', {
        objects: [
          {
            foo: 1
          },
          {
            bar: 2
          }
        ]
      })
    })
  })

  describe('error', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass arguments to context.parameters', () => {
      console.error('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('error', 'console.error', {
        parameters: ['foo', 'bar', 'baz']
      })
    })
  })

  describe('group', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should log a group opener', () => {
      console.group()

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.group', {
        label: undefined
      })
    })

    it('should accept a label', () => {
      console.group('label')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.group', {
        label: 'label'
      })
    })

    it('should cause subsequent logs to be indented', () => {
      console.group('level 1')
      console.log('Test ConsoleAdapter')
      console.group('level 2')
      console.log('Test ConsoleAdapter')

      expect(logger.log).toHaveBeenCalledTimes(4)
      expect(logger.log).toHaveBeenNthCalledWith(2, 'debug', '  console.log', {
        parameters: ['Test ConsoleAdapter']
      })
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'debug',
        '    console.log',
        {
          parameters: ['Test ConsoleAdapter']
        }
      )
    })
  })

  describe('groupCollapsed', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should log a group opener', () => {
      console.groupCollapsed()

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith(
        'debug',
        'console.groupCollapsed',
        {
          label: undefined
        }
      )
    })

    it('should accept a label', () => {
      console.groupCollapsed('label')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith(
        'debug',
        'console.groupCollapsed',
        {
          label: 'label'
        }
      )
    })

    it('should cause subsequent logs to be indented', () => {
      console.groupCollapsed('level 1')
      console.log('Test ConsoleAdapter')
      console.groupCollapsed('level 2')
      console.log('Test ConsoleAdapter')

      expect(logger.log).toHaveBeenCalledTimes(4)
      expect(logger.log).toHaveBeenNthCalledWith(2, 'debug', '  console.log', {
        parameters: ['Test ConsoleAdapter']
      })
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'debug',
        '    console.log',
        {
          parameters: ['Test ConsoleAdapter']
        }
      )
    })
  })

  describe('groupEnd', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should tolerate calls with missing opener', () => {
      console.groupEnd()

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.groupEnd')
    })

    it('should recude indentation of open groups', () => {
      console.group()
      console.groupCollapsed()
      console.log('Test ConsoleAdapter')
      console.groupEnd()
      console.log('Test ConsoleAdapter')
      console.groupEnd()
      console.log('Test ConsoleAdapter')

      expect(logger.log).toHaveBeenCalledTimes(7)
      expect(logger.log).toHaveBeenNthCalledWith(
        3,
        'debug',
        '    console.log',
        {
          parameters: ['Test ConsoleAdapter']
        }
      )
      expect(logger.log).toHaveBeenNthCalledWith(5, 'debug', '  console.log', {
        parameters: ['Test ConsoleAdapter']
      })
      expect(logger.log).toHaveBeenNthCalledWith(7, 'debug', 'console.log', {
        parameters: ['Test ConsoleAdapter']
      })
    })
  })

  describe('info', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass arguments to context.parameters', () => {
      console.info('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('info', 'console.info', {
        parameters: ['foo', 'bar', 'baz']
      })
    })
  })

  describe('log', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass arguments to context.parameters', () => {
      console.log('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.log', {
        parameters: ['foo', 'bar', 'baz']
      })
    })
  })

  describe('table', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should tolerate invalid data', () => {
      console.table([{ foo: 1 }], 'bar')
      console.table('foo', ['bar'])

      expect(logger.log).toHaveBeenCalledTimes(2)
      expect(logger.log).toHaveBeenNthCalledWith(1, 'debug', 'console.table', {
        data: [{}]
      })
      expect(logger.log).toHaveBeenNthCalledWith(2, 'debug', 'console.table', {
        data: 'foo'
      })
    })

    it('should pass through data', () => {
      console.table([{ foo: 1 }, { foo: 2 }])

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.table', {
        data: [{ foo: 1 }, { foo: 2 }]
      })
    })

    it('should filter data by single property', () => {
      console.table(
        [
          { foo: 1, bar: 2 },
          { foo: 3, bar: 4 }
        ],
        'bar'
      )

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.table', {
        data: [{ bar: 2 }, { bar: 4 }]
      })
    })

    it('should filter data by multiple properties', () => {
      console.table(
        [
          { foo: 1, bar: 2, baz: 3 },
          { foo: 4, bar: 5, baz: 6 }
        ],
        ['foo', 'baz']
      )

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.table', {
        data: [
          { foo: 1, baz: 3 },
          { foo: 4, baz: 6 }
        ]
      })
    })
  })

  describe('time/timeLog/timeEnd', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should use "default" as default label', () => {
      console.time()
      console.timeLog()
      console.timeEnd()

      expect(logger.log).toHaveBeenCalledTimes(2)
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'debug',
        'console.timeLog',
        {
          label: 'default',
          elapsed: expect.any(Number),
          data: []
        }
      )
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'debug',
        'console.timeEnd',
        {
          label: 'default',
          elapsed: expect.any(Number)
        }
      )
    })

    it('should tolerate timeLog for non-existent timers', () => {
      console.timeLog('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.timeLog', {
        label: 'foo',
        elapsed: null,
        data: ['bar', 'baz']
      })
    })

    it('should tolerate timeLog for ended timers', () => {
      console.time('foo')
      console.timeEnd('foo')
      console.timeLog('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(2)
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'debug',
        'console.timeEnd',
        {
          label: 'foo',
          elapsed: expect.any(Number)
        }
      )
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'debug',
        'console.timeLog',
        {
          label: 'foo',
          elapsed: null,
          data: ['bar', 'baz']
        }
      )
    })

    it('should report elapsed time of pre-existing timers', () => {
      console.time('foo')
      console.timeLog('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.timeLog', {
        label: 'foo',
        elapsed: expect.any(Number),
        data: ['bar', 'baz']
      })
    })
  })

  describe('trace', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass arguments to context.data', () => {
      console.trace('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('debug', 'console.trace', {
        trace: expect.any(String),
        data: ['foo', 'bar', 'baz']
      })
    })
  })

  describe('warn', () => {
    beforeEach(() => {
      logger = new MockLogger()
      console = new ConsoleAdapter(logger)
    })

    it('should pass arguments to context.parameters', () => {
      console.warn('foo', 'bar', 'baz')

      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenLastCalledWith('warning', 'console.warn', {
        parameters: ['foo', 'bar', 'baz']
      })
    })
  })
})
