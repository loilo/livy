export function tick() {
  return new Promise(resolve => process.nextTick(resolve))
}
