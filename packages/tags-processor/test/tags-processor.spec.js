import { TagsProcessor } from '../src/tags-processor'

describe('@livy/tags-processor', () => {
  it('should add tags to records (empty list default)', () => {
    const processor = new TagsProcessor()
    expect(processor.process(record('info'))).toEqual(
      record('info', '', {
        extra: { tags: [] }
      })
    )
  })

  it('should have modifiable tags', () => {
    const processor = new TagsProcessor(['a'])
    expect(processor.process(record('info'))).toEqual(
      record('info', '', {
        extra: { tags: ['a'] }
      })
    )

    processor.setTags('b')
    expect(processor.process(record('info'))).toEqual(
      record('info', '', {
        extra: { tags: ['b'] }
      })
    )

    processor.addTags('c')
    expect(processor.process(record('info'))).toEqual(
      record('info', '', {
        extra: { tags: ['b', 'c'] }
      })
    )
  })
})
