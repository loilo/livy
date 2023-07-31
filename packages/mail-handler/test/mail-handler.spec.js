import { describe, expect, it, afterEach, vi } from 'vitest'
import '@livy/test-utils/matchers/string-containing-times.js'

import * as nodemailer from 'nodemailer'
import { MailHandler } from '../src/mail-handler'

const { record, MockFormatter } = livyTestGlobals

const handlerOptions = {
  subject: 'Subject',
  to: 'to@example.com',
  from: 'from@example.com'
}

vi.mock(
  'nodemailer',
  livyTestGlobals.getMockedModule(import('./mocks/nodemailer.js'))
)

describe('@livy/mail-handler', () => {
  afterEach(() => {
    nodemailer.__reset()
  })

  it('should create a Nodemailer instance with default options on handler creation', () => {
    new MailHandler(handlerOptions)

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1)
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        sendmail: true
      })
    )
  })

  it('should check the types of the basics mailer options', () => {
    expect(() => {
      new MailHandler({ ...handlerOptions, subject: 0 })
    }).toThrowError(new Error('Subject must be a string'))

    expect(() => {
      new MailHandler({ ...handlerOptions, to: 0 })
    }).toThrowError(new Error('Receiver must be a string or an array'))

    expect(() => {
      new MailHandler({ ...handlerOptions, from: 0 })
    }).toThrowError(new Error('Sender must be a string'))
  })

  it('should ensure that a template is provided', () => {
    expect(() => {
      new MailHandler({ ...handlerOptions, template: {} })
    }).toThrowError(
      new Error('Either a HTML or a plain text template must be provided')
    )
  })

  it('should call the mailer, respecting the default level', async () => {
    const handler = new MailHandler(handlerOptions)

    await Promise.all([
      // These should be ignored
      handler.handle(record('debug', 'Test MailHandler')),
      handler.handle(record('info', 'Test MailHandler')),
      handler.handle(record('notice', 'Test MailHandler')),

      // These should be mailed
      handler.handle(record('warning', 'Test MailHandler')),
      handler.handle(record('error', 'Test MailHandler')),
      handler.handle(record('critical', 'Test MailHandler')),
      handler.handle(record('alert', 'Test MailHandler')),
      handler.handle(record('emergency', 'Test MailHandler'))
    ])

    expect(nodemailer.sendMail).toHaveBeenCalledTimes(5)
  })

  it('should call sendMail(), respecting the default level (batch handling)', async () => {
    const handler = new MailHandler(handlerOptions)

    await handler.handleBatch([
      // These should be ignored
      record('debug', 'Test MailHandler'),
      record('info', 'Test MailHandler'),
      record('notice', 'Test MailHandler'),

      // These should be mailed
      record('warning', 'Test MailHandler'),
      record('error', 'Test MailHandler'),
      record('critical', 'Test MailHandler'),
      record('alert', 'Test MailHandler'),
      record('emergency', 'Test MailHandler')
    ])

    expect(nodemailer.sendMail).toHaveBeenCalledTimes(1)
    expect(nodemailer.sendMail).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: 'from@example.com',
        to: 'to@example.com',
        subject: 'Subject + 4 others',
        html: expect.stringContainingTimes(5, 'Test MailHandler'),
        text: expect.stringContainingTimes(5, 'Test MailHandler')
      }),
      expect.any(Function)
    )
  })

  it('should call configured formatters', async () => {
    const handler = new MailHandler(handlerOptions)

    const htmlFormatter = new MockFormatter()
    const plainTextFormatter = new MockFormatter()

    handler.htmlFormatter = htmlFormatter
    handler.plainTextFormatter = plainTextFormatter

    await handler.handle(record('emergency', 'Test MailHandler'))

    expect(htmlFormatter.format).toHaveBeenCalledTimes(1)
    expect(htmlFormatter.format).toHaveBeenLastCalledWith(
      record('emergency', 'Test MailHandler')
    )
    expect(plainTextFormatter.format).toHaveBeenCalledTimes(1)
    expect(plainTextFormatter.format).toHaveBeenLastCalledWith(
      record('emergency', 'Test MailHandler')
    )
  })

  it('should call configured formatters (batch handling)', async () => {
    const handler = new MailHandler(handlerOptions)

    const htmlFormatter = new MockFormatter()
    const plainTextFormatter = new MockFormatter()

    handler.htmlFormatter = htmlFormatter
    handler.plainTextFormatter = plainTextFormatter

    await handler.handleBatch([
      record('warning', 'Test MailHandler'),
      record('error', 'Test MailHandler'),
      record('critical', 'Test MailHandler'),
      record('alert', 'Test MailHandler'),
      record('emergency', 'Test MailHandler')
    ])

    expect(htmlFormatter.formatBatch).toHaveBeenCalledTimes(1)
    expect(htmlFormatter.formatBatch).toHaveBeenLastCalledWith([
      record('warning', 'Test MailHandler'),
      record('error', 'Test MailHandler'),
      record('critical', 'Test MailHandler'),
      record('alert', 'Test MailHandler'),
      record('emergency', 'Test MailHandler')
    ])
    expect(plainTextFormatter.formatBatch).toHaveBeenCalledTimes(1)
    expect(plainTextFormatter.formatBatch).toHaveBeenLastCalledWith([
      record('warning', 'Test MailHandler'),
      record('error', 'Test MailHandler'),
      record('critical', 'Test MailHandler'),
      record('alert', 'Test MailHandler'),
      record('emergency', 'Test MailHandler')
    ])
  })

  it('should resort to regular handling when batch handling with one record', async () => {
    const handler = new MailHandler(handlerOptions)
    handler.handle = vi.fn(() => Promise.resolve())

    await handler.handleBatch([record('warning', 'Test MailHandler')])

    expect(handler.handle).toHaveBeenCalledTimes(1)
  })

  it('should not do anything when batch handling with no records', async () => {
    const handler = new MailHandler(handlerOptions)
    await handler.handleBatch([])
    expect(nodemailer.sendMail).not.toHaveBeenCalled()
  })

  it('should fail if mailer reports error', async () => {
    nodemailer.sendMail.mockImplementationOnce((mailOptions, callback) => {
      setImmediate(() => {
        callback(new Error('Mock error'))
      })
    })

    const handler = new MailHandler(handlerOptions)

    let mailerError
    try {
      await handler.handle(record('warning', 'Test MailHandler'))
    } catch (error) {
      mailerError = error
    }

    expect(mailerError).toEqual(new Error('Mock error'))
  })

  it('should pass the correct options to the mailer', async () => {
    const handler = new MailHandler(handlerOptions)

    await handler.handle(record('warning', 'Test MailHandler'))

    expect(nodemailer.sendMail).toHaveBeenCalledTimes(1)
    expect(nodemailer.sendMail).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: 'from@example.com',
        to: 'to@example.com',
        subject: 'Subject',
        html: expect.stringContaining('Test MailHandler'),
        text: expect.stringContaining('Test MailHandler')
      }),
      expect.any(Function)
    )
  })

  it('should respect the "transport" option', () => {
    new MailHandler({
      ...handlerOptions,
      transport: {
        sendmail: false,
        foo: 'bar'
      }
    })

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1)
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        sendmail: false,
        foo: 'bar'
      })
    )
  })

  it('should respect the "level" option', async () => {
    const handler = new MailHandler({
      ...handlerOptions,
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBe(false)
    expect(handler.isHandling('notice')).toBe(true)
    await handler.handle(record('info', 'info'))
    await handler.handle(record('notice', 'notice'))

    expect(nodemailer.sendMail).toHaveBeenCalledTimes(1)
    expect(nodemailer.sendMail).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: 'from@example.com',
        to: 'to@example.com',
        subject: 'Subject',
        html: expect.stringContaining('notice'),
        text: expect.stringContaining('notice')
      }),
      expect.any(Function)
    )
  })

  it('should respect the "bubble" option', async () => {
    const bubblingHandler = new MailHandler({
      ...handlerOptions
    })
    const nonBubblingHandler = new MailHandler({
      ...handlerOptions,
      bubble: false
    })

    expect(await bubblingHandler.handle(record('warning'))).toBe(false)
    expect(await nonBubblingHandler.handle(record('warning'))).toBe(true)
  })
})
