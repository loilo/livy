import got from 'got'
import { HttpHandler } from '../src/http-handler'

describe('@livy/http-handler', () => {
  afterEach(() => {
    got.__reset()
  })

  it('should send log records to the configured URL', async () => {
    const handler = new HttpHandler('https://example.com')
    await handler.handle(record('info'))

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenLastCalledWith('https://example.com', {})
  })

  it('should accept a record-dependent callback as the URL', async () => {
    const handler = new HttpHandler(
      record => `https://example.com/${record.level}`
    )
    await handler.handle(record('info'))

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenLastCalledWith('https://example.com/info', {})
  })

  it('should respect the "requestOptions" option', async () => {
    const handler = new HttpHandler('https://example.com', {
      requestOptions: {
        throwHttpErrors: false
      }
    })
    await handler.handle(record('info'))

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenLastCalledWith('https://example.com', {
      throwHttpErrors: false
    })
  })

  it('should accept a record-dependent callback as the "requestOptions" option', async () => {
    const handler = new HttpHandler('https://example.com', {
      requestOptions: record => ({
        body: JSON.stringify(record)
      })
    })
    await handler.handle(record('info'))

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenLastCalledWith('https://example.com', {
      body: JSON.stringify(record('info'))
    })
  })

  it('should batch handle records in parallel', async () => {
    const handler = new HttpHandler('https://example.com')

    let finishedFirst = false

    got
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              finishedFirst = true
              resolve()
            }, 20)
          })
      )
      .mockImplementationOnce(async () => {
        expect(finishedFirst).toBeFalse()
      })

    await handler.handleBatch([record('info'), record('notice')])

    expect(got).toHaveBeenCalledTimes(2)
  })

  it('should respect the "sequential" option', async () => {
    const handler = new HttpHandler('https://example.com', {
      sequential: true
    })

    let finishedFirst = false

    got
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              finishedFirst = true
              resolve()
            }, 20)
          })
      )
      .mockImplementationOnce(async () => {
        expect(finishedFirst).toBeTrue()
      })

    await handler.handleBatch([record('info'), record('notice')])

    expect(got).toHaveBeenCalledTimes(2)
  })

  it('should respect the "allowBatchRequests" option', async () => {
    const handler = new HttpHandler('https://example.com', {
      allowBatchRequests: true,
      requestOptions: records => ({
        body: JSON.stringify(records)
      })
    })

    await handler.handleBatch([record('info'), record('notice')])

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenLastCalledWith('https://example.com', {
      body: JSON.stringify([record('info'), record('notice')])
    })
  })

  it('should respect the "level" option', async () => {
    const handler = new HttpHandler(
      record => `https://example.com/${record.level}`,
      {
        level: 'notice'
      }
    )

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()
    await handler.handle(record('info', 'info'))
    await handler.handle(record('notice', 'notice'))

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenLastCalledWith('https://example.com/notice', {})
  })

  it('should respect the "bubble" option', async () => {
    const bubblingHandler = new HttpHandler('https://example.com')
    const nonBubblingHandler = new HttpHandler('https://example.com', {
      bubble: false
    })

    expect(await bubblingHandler.handle(record('warning'))).toBeFalse()
    expect(await nonBubblingHandler.handle(record('warning'))).toBeTrue()
  })
})
