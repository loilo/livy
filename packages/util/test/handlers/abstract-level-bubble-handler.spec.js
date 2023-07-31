import { describe, expect, it } from 'vitest'
import { AbstractLevelBubbleHandler } from '../../src/handlers/abstract-level-bubble-handler'

class Handler extends AbstractLevelBubbleHandler {}

describe('@livy/util/lib/handlers/abstract-level-bubble-handler', () => {
  it('should expose a default "level" and "bubble" option', async () => {
    const handler = new Handler()

    expect(handler.level).toBe('debug')
    expect(handler.bubble).toBe(true)
  })

  it('should respect the "bubble" option', async () => {
    const handler = new Handler({
      bubble: false
    })

    expect(handler.bubble).toBe(false)
  })

  it('should respect the "level" option', async () => {
    const handler = new Handler({
      level: 'warning'
    })

    expect(handler.level).toBe('warning')
  })
})
