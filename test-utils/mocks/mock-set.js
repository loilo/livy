import { vi } from 'vitest'

export function MockSet() {
  this.size = 0
  this.add = vi.fn(() => this)
  this.clear = vi.fn()
  this.delete = vi.fn(() => false)
  this.entries = vi.fn(function* () {})
  this.forEach = vi.fn()
  this.has = vi.fn(() => false)
  this.keys = vi.fn(function* () {})
  this.values = vi.fn(function* () {})
  this[Symbol.iterator] = function* () {}
}
