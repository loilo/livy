import { describe, expect, it } from 'vitest'

/**
 * @vitest-environment jsdom
 */

import * as timer from '../src/timer'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('@livy/util/lib/timer', () => {
  it('should recognize a Timer from environment', () => {
    expect(timer.Timer).toBe(timer.NodeTimer)
  })

  it('should get null when timer is not running', () => {
    const timerInstance = new timer.NodeTimer()

    expect(timerInstance.get()).toBeNull()
  })

  it('should report whether timing is running', () => {
    const timerInstance = new timer.NodeTimer()

    expect(timerInstance.running()).toBe(false)
    timerInstance.start()
    expect(timerInstance.running()).toBe(true)
  })

  it('should return a higher number on get', async () => {
    const timerInstance = new timer.NodeTimer()
    timerInstance.start()

    await delay(10)
    const time1 = timerInstance.get()

    await delay(10)
    const time2 = timerInstance.get()

    expect(typeof time1).toBe('number')
    expect(typeof time2).toBe('number')
    expect(time1).toBeGreaterThan(0)
    expect(time2).toBeGreaterThan(time1)
  })

  it('should stop the timer on reset', async () => {
    const timerInstance = new timer.NodeTimer()
    timerInstance.start()

    await delay(10)

    expect(typeof timerInstance.reset()).toBe('number')
    expect(timerInstance.running()).toBe(false)
  })
})
