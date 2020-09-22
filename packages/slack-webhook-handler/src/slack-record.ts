import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LogLevel, SeverityMap } from '@livy/contracts/lib/log-level'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { LineFormatter } from '@livy/line-formatter'
import { FormattableHandlerMixin } from '@livy/util/lib/handlers/formattable-handler-mixin'
import { capitalizeFirstLetter, isEmpty } from '@livy/util/lib/helpers'
import { AnyObject } from '@livy/util/lib/types'

const COLOR_DANGER = 'danger'
const COLOR_WARNING = 'warning'
const COLOR_GOOD = 'good'
const COLOR_DEFAULT = '#e3e4e6'

export interface AttachmentField {
  title: string
  value: string
  short: boolean
}

export interface SlackRecordOptions {
  channel: string
  username: string
  useAttachment: boolean
  userIcon: string | undefined
  useShortAttachment: boolean
  includeContextAndExtra: boolean
  excludedFields: string[]
  formatter: FormatterInterface | undefined
}

/**
 * Slack record utility helping to log to Slack webhooks or API.
 *
 * @see https://api.slack.com/incoming-webhooks
 * @see https://api.slack.com/docs/message-attachments
 */
export class SlackRecord extends FormattableHandlerMixin(class {}) {
  protected static readonly COLOR_DANGER = COLOR_DANGER
  protected static readonly COLOR_WARNING = COLOR_WARNING
  protected static readonly COLOR_GOOD = COLOR_GOOD
  protected static readonly COLOR_DEFAULT = COLOR_DEFAULT

  /**
   * Slack channel (encoded ID or name)
   */
  private channel?: string

  /**
   * Name of a bot
   */
  private username?: string

  /**
   * User icon e.g. 'ghost', 'http://example.com/user.png'
   */
  private userIcon: string

  /**
   * Whether the message should be added to Slack as attachment (plain text otherwise)
   */
  private useAttachment: boolean

  /**
   * Whether the the context/extra messages added to Slack as attachments are in short style
   */
  private useShortAttachment: boolean

  /**
   * Whether the attachment should include context and extra data
   */
  private includeContextAndExtra: boolean

  /**
   * Dot separated list of fields to exclude from slack message. E.g. ['context.field1', 'extra.field2']
   */
  private excludedFields: string[]

  public constructor({
    channel,
    username,
    useAttachment = true,
    userIcon,
    useShortAttachment = false,
    includeContextAndExtra = false,
    excludedFields = [],
    formatter
  }: Partial<SlackRecordOptions> = {}) {
    super()

    this.channel = channel
    this.username = username
    this.userIcon = (userIcon || '').replace(/^:*(.*[^:]+)?:*$/g, '$1')
    this.useAttachment = useAttachment
    this.useShortAttachment = useShortAttachment
    this.includeContextAndExtra = includeContextAndExtra
    this.excludedFields = excludedFields
    this.explicitFormatter = formatter
  }

  /**
   * Get required data in format that Slack is expecting
   *
   * @param record The log record to get data for
   */
  public getSlackData(record: LogRecord) {
    const data: AnyObject = {}
    const clearedRecord = this.removeExcludedFields(record)

    if (this.username) {
      data.username = this.username
    }

    if (this.channel) {
      data.channel = this.channel
    }

    let message: string
    if (!this.useAttachment) {
      message = this.formatter.format(clearedRecord)
    } else {
      message = clearedRecord.message
    }

    if (this.useAttachment) {
      const attachment: AnyObject = {
        fallback: message,
        text: message,
        color: this.getAttachmentColor(clearedRecord.level),
        fields: [],
        mrkdwn_in: ['fields'],
        ts: clearedRecord.datetime.toSeconds()
      }

      if (this.useShortAttachment) {
        attachment.title = clearedRecord.level
      } else {
        attachment.title = 'Message'
        attachment.fields.push(
          this.generateAttachmentField('Level', clearedRecord.level)
        )
      }

      if (this.includeContextAndExtra) {
        for (const key of ['context', 'extra'] as const) {
          if (isEmpty(clearedRecord[key])) {
            continue
          }

          if (this.useShortAttachment) {
            attachment.fields.push(
              this.generateAttachmentField(key, clearedRecord[key])
            )
          } else {
            // Add all extra fields as individual fields in attachment
            attachment.fields.push(
              ...this.generateAttachmentFields(clearedRecord[key])
            )
          }
        }
      }

      data.attachments = [attachment]
    } else {
      data.text = message
    }

    if (this.userIcon) {
      try {
        new URL(this.userIcon)
        data.icon_url = this.userIcon
      } catch {
        data.icon_emoji = `:${this.userIcon}:`
      }
    }

    return data
  }

  /**
   * Get a Slack message attachment color associated with the provided level
   *
   * @param level The log level to get the color for
   */
  public getAttachmentColor(level: LogLevel) {
    const severity = SeverityMap[level]
    switch (true) {
      case severity <= SeverityMap.error:
        return COLOR_DANGER
      case severity <= SeverityMap.warning:
        return COLOR_WARNING
      case severity <= SeverityMap.info:
        return COLOR_GOOD
      default:
        return COLOR_DEFAULT
    }
  }

  /**
   * Stringify an array of key/value pairs to be used in attachment fields
   *
   * @param fields
   */
  public stringify(fields: AnyObject | any[]) {
    const isObject = !Array.isArray(fields)
    const hasNestedData =
      !Array.isArray(fields) ||
      fields.some(field => typeof field === 'object' && field !== null)

    return isObject || hasNestedData
      ? JSON.stringify(fields, null, 2)
      : JSON.stringify(fields)
  }

  /**
   * @inheritdoc
   */
  public getDefaultFormatter() {
    return new LineFormatter({
      include: {
        context: this.includeContextAndExtra,
        extra: this.includeContextAndExtra
      }
    })
  }

  /**
   * Generate an attachment field
   *
   * @param title The title of the attachment
   * @param value The value to render
   */
  private generateAttachmentField(
    title: string,
    value: string | number | AnyObject | any[]
  ): AttachmentField {
    const stringifiedValue =
      typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : '```' + this.stringify(value) + '```'

    return {
      title: capitalizeFirstLetter(title),
      value: stringifiedValue,
      short: false
    }
  }

  /**
   * Generate a collection of attachment fields
   *
   * @param data A (partial) log record log record to generate fields for
   */
  private generateAttachmentFields(data: Partial<LogRecord>) {
    return Object.entries(data).map(([key, value]) =>
      this.generateAttachmentField(key, value!)
    )
  }

  /**
   * Get a copy of record with fields excluded according to `this.excludedFields`
   *
   * @param record The record to reduce
   */
  private removeExcludedFields(record: LogRecord) {
    const copy = { ...record } as AnyObject

    for (const field of this.excludedFields) {
      const keys = field.split('.')
      let node = copy
      const lastKey = keys[keys.length - 1]

      for (const key of keys) {
        if (!(key in node)) {
          break
        }
        if (lastKey === key) {
          delete node[key as keyof LogRecord]
          break
        }
        node = node[key as keyof LogRecord]
      }
    }

    return copy as LogRecord
  }
}
