/**
 * @jest-environment jsdom
 */

jest.mock('fs')
jest.mock('os')

const { DomHandler } = await import('../src/dom-handler')

describe('@livy/dom-handler', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should write logs to the referenced element', () => {
    const container = document.createElement('div')
    const handler = new DomHandler(container)
    handler.handleSync(record('debug', 'Test DomHandler'))
    handler.handleSync(record('info', 'Test DomHandler'))

    expect(container.innerHTML).toMatchSnapshot()
  })

  it('should write logs to a selector (with DOM ready)', () => {
    const container = document.createElement('div')
    container.id = 'logs'
    document.body.append(container)

    const handler = new DomHandler('#logs')
    handler.handleSync(record('debug', 'Test DomHandler'))

    expect(container.innerHTML).toMatchSnapshot()
  })

  describe('interaction with "loading" document.readyState', () => {
    let handler

    afterEach(() => {
      handler.close()
      delete document.readyState
    })

    it('should asynchronously write logs to a selector (with DOM not initially ready)', async () => {
      const container = document.createElement('div')
      container.id = 'logs'

      // Override document.readyState to be "loading"
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true
      })

      handler = new DomHandler('#logs')
      const logged = handler.handle(record('debug', 'Test DomHandler'))

      // Attach element, update document.readyState, dispatch event
      document.body.append(container)
      document.readyState = 'complete'
      document.dispatchEvent(new Event('DOMContentLoaded'))

      await logged
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('should fail to asynchronously write logs to a non-existing selector (with DOM not initially ready)', async () => {
      const container = document.createElement('div')
      container.id = 'logs'

      // Override document.readyState to be "loading"
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true
      })

      handler = new DomHandler('#logs')
      const logged = handler.handle(record('debug', 'Test DomHandler'))

      // Attach element, update document.readyState, dispatch event
      document.readyState = 'complete'
      document.dispatchEvent(new Event('DOMContentLoaded'))

      let notFoundError
      try {
        await logged
      } catch (error) {
        notFoundError = error
      }

      expect(notFoundError).toEqual(
        new Error(
          `Could not find DomHandler target element at selector "#logs"`
        )
      )
    })

    it('should fail to synchronously write logs to a non-existing selector (with DOM not ready)', () => {
      const container = document.createElement('div')
      container.id = 'logs'

      // Override document.readyState to be "loading"
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true
      })

      handler = new DomHandler('#logs')

      document.body.appendChild(container)

      expect(() => {
        handler.handleSync(record('debug', 'Test DomHandler'))
      }).toThrowError(new Error(`Could not find DomHandler target element`))
    })
  })

  it('should clear the DOM element on reset', () => {
    const container = document.createElement('div')

    const handler = new DomHandler(container)
    handler.handleSync(record('info', 'Test ArrayHandler'))
    handler.reset()

    expect(container.innerHTML).toBeEmpty()
  })

  it('should respect the "reversed" option', () => {
    const container = document.createElement('div')
    const handler = new DomHandler(container, { reversed: true })
    handler.handleSync(record('debug', 'Test DomHandler'))
    handler.handleSync(record('info', 'Test DomHandler'))

    expect(container.innerHTML).toMatchSnapshot()
  })

  it('should respect the "formatter" option', () => {
    const container = document.createElement('div')
    const handler = new DomHandler(container, {
      formatter: {
        format(record) {
          return record.level + '<br>'
        },
        formatBatch(records) {
          return records.map(record => this.format(record)).join('\n')
        }
      }
    })
    handler.handleSync(record('debug', 'Test DomHandler'))
    handler.handleSync(record('info', 'Test DomHandler'))

    expect(container.innerHTML).toBe('debug<br>info<br>')
  })

  it('should respect the "level" option', () => {
    const container = document.createElement('div')
    const handler = new DomHandler(container, {
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()

    handler.handleSync(record('info'))
    handler.handleSync(record('notice'))

    expect(container.innerHTML).toMatchSnapshot()
  })

  it('should respect the "bubble" option', () => {
    const bubblingHandler = new DomHandler(document.createElement('div'))
    const nonBubblingHandler = new DomHandler(document.createElement('div'), {
      bubble: false
    })

    expect(bubblingHandler.handleSync(record('debug'))).toBeFalse()
    expect(nonBubblingHandler.handleSync(record('debug'))).toBeTrue()
  })
})
