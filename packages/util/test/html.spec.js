import { describe, expect, test } from 'vitest'
import { HTML } from '../src/html'

describe('@livy/util/lib/html', () => {
  test('HTML', () => {
    const result = HTML`<strong id="${'dangerous"id'}">${HTML`<br>`}${HTML(
      '<br>'
    )}${'<br>'}</strong>`
    expect(result).toHaveProperty('toString', expect.any(Function))
    expect(String(result)).toBe(
      `<strong id="dangerous&quot;id"><br><br>&lt;br&gt;</strong>`
    )
  })
})
