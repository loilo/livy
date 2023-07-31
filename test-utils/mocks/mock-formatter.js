import { vi } from 'vitest'

export function MockFormatter() {
  this.format = vi.fn(() => '')
  this.formatBatch = vi.fn(() => '')
}
