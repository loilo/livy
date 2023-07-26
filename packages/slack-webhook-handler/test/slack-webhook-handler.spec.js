import got from 'got'

import { SlackWebhookHandler } from '../src/slack-webhook-handler'
import { SlackRecord } from '../src/slack-record'

const timestamp = Date.parse(TEST_CONSTANTS.DATE_ISO)

describe('@livy/slack-webhook-handler', () => {
  afterEach(() => {
    got.__reset()
  })

  it('should send notifications with correct data and respect default level', async () => {
    const handler = new SlackWebhookHandler('https://example.com')

    await Promise.all([
      // This should be ignored
      handler.handle(record('error', 'Test SlackWebhookHandler')),

      // This should be delivered
      handler.handle(record('critical', 'Test SlackWebhookHandler'))
    ])

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenCalledWith('https://example.com', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        attachments: [
          {
            fallback: 'Test SlackWebhookHandler',
            text: 'Test SlackWebhookHandler',
            color: SlackRecord.COLOR_DANGER,
            fields: [
              {
                title: 'Level',
                value: 'critical',
                short: false
              }
            ],
            mrkdwn_in: ['fields'],
            ts: Math.floor(timestamp / 1000),
            title: 'Message'
          }
        ]
      })
    })
  })

  it('should respect provided username, channel and emoji', async () => {
    const handler = new SlackWebhookHandler('https://example.com', {
      username: 'User',
      channel: 'Channel',
      iconEmoji: 'flashlight'
    })

    await handler.handle(record('critical', 'Test SlackWebhookHandler'))

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenCalledWith('https://example.com', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        username: 'User',
        channel: 'Channel',
        attachments: [
          {
            fallback: 'Test SlackWebhookHandler',
            text: 'Test SlackWebhookHandler',
            color: SlackRecord.COLOR_DANGER,
            fields: [
              {
                title: 'Level',
                value: 'critical',
                short: false
              }
            ],
            mrkdwn_in: ['fields'],
            ts: Math.floor(timestamp / 1000),
            title: 'Message'
          }
        ],
        icon_emoji: ':flashlight:'
      })
    })
  })

  it('should accept a URL as an emoji', async () => {
    const handler = new SlackWebhookHandler('https://example.com', {
      iconEmoji: 'https://example.com/emoji.png'
    })

    expect(handler.slackRecord.getSlackData(record('info'))).toMatchObject({
      icon_url: 'https://example.com/emoji.png'
    })
  })

  it('should reflect log level in colors', async () => {
    const webhookUrl = 'https://example.com'
    const handler = new SlackWebhookHandler(webhookUrl, {
      level: 'debug'
    })

    await handler.handle(record('debug', 'Test SlackWebhookHandler'))
    await handler.handle(record('info', 'Test SlackWebhookHandler'))
    await handler.handle(record('notice', 'Test SlackWebhookHandler'))
    await handler.handle(record('warning', 'Test SlackWebhookHandler'))
    await handler.handle(record('error', 'Test SlackWebhookHandler'))
    await handler.handle(record('critical', 'Test SlackWebhookHandler'))
    await handler.handle(record('alert', 'Test SlackWebhookHandler'))
    await handler.handle(record('emergency', 'Test SlackWebhookHandler'))

    expect(got).toHaveBeenCalledTimes(8)
    expect(got).toHaveBeenNthCalledWith(
      1,
      webhookUrl,
      expect.objectContaining({
        body: expect.stringContaining(`"color":"${SlackRecord.COLOR_DEFAULT}"`)
      })
    )

    const goodParams = [
      webhookUrl,
      expect.objectContaining({
        body: expect.stringContaining(`"color":"${SlackRecord.COLOR_GOOD}"`)
      })
    ]
    expect(got).toHaveBeenNthCalledWith(2, ...goodParams)
    expect(got).toHaveBeenNthCalledWith(3, ...goodParams)

    expect(got).toHaveBeenNthCalledWith(
      4,
      webhookUrl,
      expect.objectContaining({
        body: expect.stringContaining(`"color":"${SlackRecord.COLOR_WARNING}"`)
      })
    )

    const dangerParams = [
      webhookUrl,
      expect.objectContaining({
        body: expect.stringContaining(`"color":"${SlackRecord.COLOR_DANGER}"`)
      })
    ]
    expect(got).toHaveBeenNthCalledWith(5, ...dangerParams)
    expect(got).toHaveBeenNthCalledWith(6, ...dangerParams)
    expect(got).toHaveBeenNthCalledWith(7, ...dangerParams)
    expect(got).toHaveBeenNthCalledWith(8, ...dangerParams)
  })

  it('should provide access to the webhook url', () => {
    const webhookUrl = 'https://example.com'
    expect(new SlackWebhookHandler(webhookUrl).webhookUrl).toBe(webhookUrl)
  })

  it('should provide access to the slack record', () => {
    expect(
      new SlackWebhookHandler('https://example.com').slackRecord
    ).toBeInstanceOf(SlackRecord)
  })

  it("should return the slack record's defaul formatter", async () => {
    const handler = new SlackWebhookHandler('https://example.com')

    expect(handler.defaultFormatter).toEqual(
      handler.slackRecord.defaultFormatter
    )
  })

  it('should be able to set the formatter', async () => {
    const handler = new SlackWebhookHandler('https://example.com')

    const formatter = new MockFormatter()
    handler.formatter = formatter

    await handler.handle(record('critical', 'Test SlackWebhookHandler'))

    expect(formatter.format).toHaveBeenCalledTimes(1)
    expect(formatter.format).toHaveBeenLastCalledWith(
      record('critical', 'Test SlackWebhookHandler')
    )
  })

  it('should respect the "includeContextAndExtra" option', async () => {
    const handler = new SlackWebhookHandler('https://example.com', {
      includeContextAndExtra: true
    })

    await handler.handle(
      record('critical', 'Test SlackWebhookHandler', {
        context: { context: 1 },
        extra: { extra: 2 }
      })
    )

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenCalledWith('https://example.com', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        attachments: [
          {
            fallback: 'Test SlackWebhookHandler',
            text: 'Test SlackWebhookHandler',
            color: SlackRecord.COLOR_DANGER,
            fields: [
              {
                title: 'Level',
                value: 'critical',
                short: false
              },
              {
                title: 'Context',
                value: '1',
                short: false
              },
              {
                title: 'Extra',
                value: '2',
                short: false
              }
            ],
            mrkdwn_in: ['fields'],
            ts: Math.floor(timestamp / 1000),
            title: 'Message'
          }
        ]
      })
    })
  })

  it('should respect the "useShortAttachment" option', async () => {
    const handler = new SlackWebhookHandler('https://example.com', {
      includeContextAndExtra: true,
      useShortAttachment: true
    })

    await handler.handle(
      record('critical', 'Test SlackWebhookHandler', {
        context: { context: 1 }
      })
    )

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenCalledWith('https://example.com', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        attachments: [
          {
            fallback: 'Test SlackWebhookHandler',
            text: 'Test SlackWebhookHandler',
            color: SlackRecord.COLOR_DANGER,
            fields: [
              {
                title: 'Context',
                value: '```' + JSON.stringify({ context: 1 }, null, 2) + '```',
                short: false
              }
            ],
            mrkdwn_in: ['fields'],
            ts: Math.floor(timestamp / 1000),
            title: 'critical'
          }
        ]
      })
    })
  })

  it('should respect the "formatter" option', async () => {
    const formatter = new MockFormatter()
    const nonBubblingHandler = new SlackWebhookHandler('https://example.com', {
      formatter
    })

    expect(nonBubblingHandler.formatter).toBe(formatter)
  })

  it('should respect the "useAttachment" option', async () => {
    const handler = new SlackWebhookHandler('https://example.com', {
      useAttachment: false
    })

    await handler.handle(
      record('critical', 'Test SlackWebhookHandler', {
        context: { context: 1 }
      })
    )

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenCalledWith('https://example.com', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        text: `${TEST_CONSTANTS.DATE_HUMAN} CRITICAL Test SlackWebhookHandler`
      })
    })
  })

  it('should respect the "excludeFields" option', async () => {
    const handler = new SlackWebhookHandler('https://example.com', {
      includeContextAndExtra: true,

      // Should tolerate non-existent fields
      excludedFields: ['context.foo.bar', 'nonexistent']
    })

    await handler.handle(
      record('critical', 'Test SlackWebhookHandler', {
        context: {
          foo: { bar: 1, baz: 2 }
        }
      })
    )

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenCalledWith('https://example.com', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        attachments: [
          {
            fallback: 'Test SlackWebhookHandler',
            text: 'Test SlackWebhookHandler',
            color: SlackRecord.COLOR_DANGER,
            fields: [
              {
                title: 'Level',
                value: 'critical',
                short: false
              },
              {
                title: 'Foo',
                value: '```' + JSON.stringify({ baz: 2 }, null, 2) + '```',
                short: false
              }
            ],
            mrkdwn_in: ['fields'],
            ts: Math.floor(timestamp / 1000),
            title: 'Message'
          }
        ]
      })
    })
  })

  it('should respect the "level" option', async () => {
    const handler = new SlackWebhookHandler('https://example.com', {
      level: 'notice'
    })

    expect(handler.isHandling('info')).toBeFalse()
    expect(handler.isHandling('notice')).toBeTrue()
    await handler.handle(record('info', 'Test SlackWebhookHandler'))
    await handler.handle(record('notice', 'Test SlackWebhookHandler'))

    expect(got).toHaveBeenCalledTimes(1)
    expect(got).toHaveBeenLastCalledWith('https://example.com', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        attachments: [
          {
            fallback: 'Test SlackWebhookHandler',
            text: 'Test SlackWebhookHandler',
            color: SlackRecord.COLOR_GOOD,
            fields: [
              {
                title: 'Level',
                value: 'notice',
                short: false
              }
            ],
            mrkdwn_in: ['fields'],
            ts: Math.floor(timestamp / 1000),
            title: 'Message'
          }
        ]
      })
    })
  })

  it('should respect the "bubble" option', async () => {
    const bubblingHandler = new SlackWebhookHandler('https://example.com')
    const nonBubblingHandler = new SlackWebhookHandler('https://example.com', {
      bubble: false
    })

    expect(await bubblingHandler.handle(record('critical'))).toBeFalse()
    expect(await nonBubblingHandler.handle(record('critical'))).toBeTrue()
  })
})
