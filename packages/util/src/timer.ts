/**
 * A tiny and simple performance measurement tool for Node.js and the browser, measuring elapsed time in milliseconds
 */

/**
 * The common timer interface
 */
export interface TimerInterface {
  start(): void
  get(): number | null
  reset(): number | null
  running(): boolean
}

/**
 * An common abstract timer with some base methods
 */
abstract class BaseTimer implements TimerInterface {
  protected abstract started: number | bigint | null

  public abstract start(): void | null
  public abstract get(): number | null

  public running() {
    return this.started !== null
  }

  public reset() {
    const value = this.get()
    this.started = null
    return value
  }
}

/**
 * A Node.js timer implementation (hrtime based)
 */
export class NodeTimer extends BaseTimer {
  protected started: bigint | null = null

  public start() {
    this.started = process.hrtime.bigint()
  }

  public get() {
    return this.started !== null
      ? Number(process.hrtime.bigint() - this.started) / 10 ** 6
      : null
  }
}

// istanbul ignore next: The Performance API is not properly implemented in JSDOM
/**
 * A browser timer implementation (Performance API based)
 */
class BrowserTimer extends BaseTimer {
  protected started: number | null = null

  public start() {
    this.started = performance.now()
  }

  public get() {
    return this.started !== null
      ? Number(performance.now() - this.started) / 10 ** 6
      : null
  }
}

/**
 * Export the appropriate timer class
 */
export const Timer = typeof process === 'object' ? NodeTimer : BrowserTimer
