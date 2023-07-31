import type { LogRecord, ProcessorInterface } from '@livy/contracts'

/**
 * Adds tags to record.extra
 */
export class TagsProcessor implements ProcessorInterface {
  private tags: string[] = []

  /**
   * @param tags Initial tags to be present
   */
  public constructor(tags: string[] = []) {
    this.setTags(...tags)
  }

  /**
   * Add tags to the processor
   *
   * @param tags The tags to add
   */
  public addTags(...tags: string[]): this {
    // Create an intermediate Set to remove duplicates
    this.tags = [...new Set([...this.tags, ...tags])]
    return this
  }

  /**
   * Set the processor's tags
   *
   * @param tags The tags to use
   */
  public setTags(...tags: string[]): this {
    this.tags = tags
    return this
  }

  /**
   * @inheritdoc
   */
  public process(record: LogRecord) {
    record.extra.tags = this.tags
    return record
  }
}
