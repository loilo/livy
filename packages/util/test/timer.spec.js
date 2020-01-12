/**
 * @jest-environment jsdom
 */

const timer = require('../src/timer')

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

    expect(timerInstance.running()).toBeFalse()
    timerInstance.start()
    expect(timerInstance.running()).toBeTrue()
  })

  it('should return a higher number on get', async () => {
    const timerInstance = new timer.NodeTimer()
    timerInstance.start()

    await delay(10)
    const time1 = timerInstance.get()

    await delay(10)
    const time2 = timerInstance.get()

    expect(time1).toBeNumber()
    expect(time2).toBeNumber()
    expect(time1).toBeGreaterThan(0)
    expect(time2).toBeGreaterThan(time1)
  })

  it('should stop the timer on reset', async () => {
    const timerInstance = new timer.NodeTimer()
    timerInstance.start()

    await delay(10)

    expect(timerInstance.reset()).toBeNumber()
    expect(timerInstance.running()).toBeFalse()
  })
})
