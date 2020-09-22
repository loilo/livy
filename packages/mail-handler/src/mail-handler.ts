import { FormatterInterface } from '@livy/contracts/lib/formatter-interface'
import { LogRecord } from '@livy/contracts/lib/log-record'
import { HtmlPrettyFormatter } from '@livy/html-pretty-formatter'
import { LineFormatter } from '@livy/line-formatter'
import {
  AbstractLevelBubbleHandler,
  AbstractLevelBubbleHandlerOptions
} from '@livy/util/lib/handlers/abstract-level-bubble-handler'
import { ProcessableHandlerMixin } from '@livy/util/lib/handlers/processable-handler-mixin'
import { replaceTokens, stripTags } from '@livy/util/lib/helpers'
import { AnyObject, RequireAtLeastOne, SetRequired } from '@livy/util/lib/types'
import {
  createTransport,
  Transport as NodemailerTransport,
  Transporter as Nodemailer
} from 'nodemailer'
import JSONTransport from 'nodemailer/lib/json-transport'
import SendmailTransport from 'nodemailer/lib/sendmail-transport'
import SESTransport from 'nodemailer/lib/ses-transport'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import StreamTransport from 'nodemailer/lib/stream-transport'

export type Transport =
  | SMTPTransport.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | NodemailerTransport

type TemplateReplacer = (template: string) => string

export interface MailTemplate {
  text: string
  html: string
}

export interface MailHandlerOptions extends AbstractLevelBubbleHandlerOptions {
  /**
   * The subject of the emails to send
   * All properties of the corresponding log record are available as %tokens%
   */
  subject: string

  /**
   * One or more receivers of the emails
   */
  to: string | string[]

  /**
   * The sender of the emails to send
   */
  from: string

  /**
   * The formatter for the HTML part of mails
   */
  htmlFormatter: FormatterInterface

  /**
   * The formatter for the plain text part of mails
   */
  plainTextFormatter: FormatterInterface

  /**
   * A template for either HTML or plain text emails or both
   * The %logs% token will be replaced with the logged record(s)
   */
  template: RequireAtLeastOne<MailTemplate>

  /**
   * Nodemailer transport options (e.g. for using SMTP)
   */
  transport: Transport
}

type PartialMailHandlerOptions = SetRequired<
  Partial<MailHandlerOptions>,
  'subject' | 'to' | 'from'
>

/**
 * Dispenses log records via email
 */
export class MailHandler extends ProcessableHandlerMixin(
  AbstractLevelBubbleHandler
) {
  protected mailer: Nodemailer
  protected subject: string
  protected to: string
  protected from: string
  protected template: MailTemplate

  protected _htmlFormatter?: FormatterInterface
  protected _plainTextFormatter?: FormatterInterface

  public constructor({
    subject,
    to,
    from,
    level = 'warning',
    htmlFormatter,
    plainTextFormatter,
    template = { html: '%logs%', text: '%logs%' },
    transport = {
      sendmail: true
    },
    ...options
  }: PartialMailHandlerOptions) {
    super({ ...options, level })

    if (typeof subject !== 'string') {
      throw new TypeError('Subject must be a string')
    }

    if (typeof to !== 'string' && !Array.isArray(to)) {
      throw new TypeError('Receiver must be a string or an array')
    }

    if (typeof from !== 'string') {
      throw new TypeError('Sender must be a string')
    }

    this.subject = subject
    this.to = (Array.isArray(to) ? to : [to]).join(', ')
    this.from = from
    this._htmlFormatter = htmlFormatter
    this._plainTextFormatter = plainTextFormatter

    if (
      typeof (template as AnyObject).html !== 'string' &&
      typeof (template as AnyObject).text !== 'string'
    ) {
      throw new TypeError(
        'Either a HTML or a plain text template must be provided'
      )
    }

    this.template = this.supplementTemplates(template)
    this.mailer = createTransport(transport)
  }

  /**
   * Supplement possibly missing template properties
   *
   * @param templates The templates as provided by the user
   */
  protected supplementTemplates(
    templates: RequireAtLeastOne<MailTemplate>
  ): MailTemplate {
    return {
      text: 'text' in templates ? templates.text : stripTags(templates.html),
      html: 'html' in templates ? templates.html : templates.text
    }
  }

  /**
   * Get the default HTML formatter
   */
  protected get defaultHtmlFormatter(): FormatterInterface {
    return new HtmlPrettyFormatter()
  }

  /**
   * Get the formatter for the HTML part of mails
   */
  public get htmlFormatter() {
    if (typeof this._htmlFormatter === 'undefined') {
      this._htmlFormatter = this.defaultHtmlFormatter
    }

    return this._htmlFormatter
  }

  /**
   * Set the formatter for the HTML part of mails
   *
   * @param formatter The formatter to use
   */
  public set htmlFormatter(formatter: FormatterInterface) {
    this._htmlFormatter = formatter
  }

  /**
   * Get the default plain text formatter
   */
  protected get defaultPlainTextFormatter(): FormatterInterface {
    return new LineFormatter()
  }

  /**
   * Get the formatter for the plain text part of mails
   */
  public get plainTextFormatter() {
    if (typeof this._plainTextFormatter === 'undefined') {
      this._plainTextFormatter = this.defaultPlainTextFormatter
    }

    return this._plainTextFormatter
  }

  /**
   * Set the formatter for the plain text part of mails
   *
   * @param formatter The formatter to use
   */
  public set plainTextFormatter(formatter: FormatterInterface) {
    this._plainTextFormatter = formatter
  }

  /**
   * Get the subject of an email
   *
   * @param record        The log record for the mail to send
   * @param tokenReplacer The token replacer to use on the subject
   */
  protected getSubject(record: LogRecord, tokenReplacer: TemplateReplacer) {
    return tokenReplacer(this.subject)
  }

  /**
   * Actually send the email via `sendmail`
   *
   * @param subject  The subject to use for the mail
   * @param textLogs The logs to send, in plain text format
   * @param htmlLogs The logs to send, in HTML format
   */
  protected send(subject: string, textLogs: string, htmlLogs?: string) {
    const text = this.createTokenReplacer({
      logs: textLogs
    })(this.template.text)

    // Only use HTML template if HTML logs are present
    const html = this.template.html
      ? this.createTokenReplacer({
          logs: htmlLogs
        })(this.template.html)
      : undefined

    return new Promise<void>((resolve, reject) => {
      this.mailer.sendMail(
        {
          from: this.from,
          to: this.to,
          subject,
          html,
          text
        },
        error => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        }
      )
    })
  }

  /**
   * @inheritdoc
   */
  public async handle(record: LogRecord) {
    if (!this.isHandling(record.level)) {
      return
    }

    const subjectTokenReplacer = this.createTokenReplacer(record)
    const subject = this.getSubject(record, subjectTokenReplacer)

    await this.send(
      subject,
      this.plainTextFormatter.format(record),
      this.template.html ? this.htmlFormatter.format(record) : undefined
    )

    return !this.bubble
  }

  /**
   * @inheritdoc
   */
  public async handleBatch(records: LogRecord[]) {
    records = records.filter(record => this.isHandling(record.level))

    if (records.length === 0) {
      return
    } else if (records.length === 1) {
      await this.handle(records[0])
      return
    }

    const latestRecord = records[records.length - 1]
    const tokenReplacer = this.createTokenReplacer(latestRecord)
    const subject = `${this.getSubject(latestRecord, tokenReplacer)} + ${
      records.length - 1
    } other${records.length === 2 ? '' : 's'}`

    this.send(
      subject,
      this.plainTextFormatter.formatBatch(records),
      this.template.html ? this.htmlFormatter.formatBatch(records) : undefined
    )
  }

  /**
   * Create a token replacer function
   *
   * @param values The key-value pairs to replace
   */
  protected createTokenReplacer(values: AnyObject): TemplateReplacer {
    return (template: string) => replaceTokens(template, values)
  }
}
