import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { AbstractFormattingProcessingHandler } from '@livy/util/lib/handlers/abstract-formatting-processing-handler'
import { AbstractLevelBubbleHandlerOptions } from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import got from 'got'
import { SlackRecord } from './slack-record'

export interface SlackWebHookHandlerOptions
  extends AbstractLevelBubbleHandlerOptions {
  /**
   * Slack channel (encoded ID or name)
   */
  channel: string

  /**
   * Dot separated list of fields to exclude from slack message. E.g. ['context.field1', 'extra.field2']
   */
  excludedFields: string[]

  /**
   * The formatter to use
   */
  formatter: FormatterInterface

  /**
   * The emoji name to use
   */
  iconEmoji: string

  /**
   * Whether the attachment should include context and extra data
   */
  includeContextAndExtra: boolean

  /**
   * Whether the message should be added to Slack as attachment (plain text otherwise)
   */
  useAttachment: boolean

  /**
   * Name of a bot to deliver the message
   */
  username: string

  /**
   * Whether the the context/extra messages added to Slack as attachments should be in a short style
   */
  useShortAttachment: boolean
}

/**
 * Sends log records to Slack through notifications
 *
 * @see https://api.slack.com/incoming-webhooks
 */
export class SlackWebhookHandler extends AbstractFormattingProcessingHandler {
  /**
   * Slack Webhook token
   * @var string
   */
  private _webhookUrl: string

  /**
   * Instance of the SlackRecord util class preparing data for Slack API.
   * @var SlackRecord
   */
  private _slackRecord: SlackRecord

  /**
   * @param webhookUrl Slack webhook URL to ping
   * @param options    Slack webhook handler options
   */
  public constructor(
    webhookUrl: string,
    {
      bubble,
      channel,
      excludedFields = [],
      formatter,
      iconEmoji,
      includeContextAndExtra = false,
      level = 'critical',
      useAttachment = true,
      username,
      useShortAttachment = false
    }: Partial<SlackWebHookHandlerOptions> = {}
  ) {
    super({ level, bubble })

    this._webhookUrl = webhookUrl
    this.explicitFormatter = formatter

    this._slackRecord = new SlackRecord({
      channel,
      username,
      useAttachment,
      userIcon: iconEmoji,
      useShortAttachment,
      includeContextAndExtra,
      excludedFields,
      formatter: this.explicitFormatter
    })
  }

  /**
   * Get the slack record associated with the handler
   */
  public get slackRecord() {
    return this._slackRecord
  }

  /**
   * Get the handler's webhook URL
   */
  public get webhookUrl() {
    return this._webhookUrl
  }

  /**
   * @inheritdoc
   */
  protected async write(record: LogRecord) {
    const postData = this._slackRecord.getSlackData(record)
    const postString = JSON.stringify(postData)

    await got(this._webhookUrl, {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: postString
    })
  }

  /**
   * @inheritdoc
   */
  public get defaultFormatter() {
    return this._slackRecord.defaultFormatter
  }

  /**
   * @inheritdoc
   */
  public set formatter(formatter: FormatterInterface) {
    this._slackRecord.formatter = formatter
  }

  /**
   * @inheritdoc
   */
  public get formatter() {
    return this._slackRecord.formatter
  }
}
