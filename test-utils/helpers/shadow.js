export function shadow(original, proxyGenerator) {
  const proxy =
    typeof proxyGenerator === 'function'
      ? proxyGenerator(original)
      : proxyGenerator
  return new Proxy(original, {
    get(target, prop, receiver) {
      const descriptor = Object.getOwnPropertyDescriptor(proxy, prop)
      if (descriptor) {
        if ('value' in descriptor) {
          return Reflect.get(proxy, prop)
        } else if ('get' in descriptor) {
          return Reflect.get(proxy, prop, original)
        }
      }
      return Reflect.get(target, prop, receiver)
    },
    set(target, prop, value, receiver) {
      const descriptor = Object.getOwnPropertyDescriptor(proxy, prop)
      if (descriptor) {
        if ('value' in descriptor) {
          return Reflect.set(proxy, prop, value)
        } else if ('set' in descriptor) {
          return Reflect.set(proxy, prop, value, original)
        }
        return false
      }
      return Reflect.set(target, prop, value, receiver)
    },
    has(target, prop) {
      return Reflect.has(proxy, prop) || Reflect.has(target, prop)
    },
    ownKeys(target) {
      return [
        ...new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(proxy)])
      ]
    },
    getOwnPropertyDescriptor(target, prop) {
      return (
        Reflect.getOwnPropertyDescriptor(proxy, prop) ??
        Reflect.getOwnPropertyDescriptor(target, prop)
      )
    }
  })
}
