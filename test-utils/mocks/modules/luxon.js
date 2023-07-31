import { shadow } from '../../helpers/shadow.js'

export default async importOriginal => {
  const luxon = await importOriginal()

  let fixatedDateTime = null

  const mock = {
    fixate(isoString) {
      fixatedDateTime = new Proxy(luxon.DateTime.fromISO(isoString), {
        get(target, key, receiver) {
          if (/^set[A-Z].*$/.test(key)) {
            return () => fixatedDateTime
          }

          return Reflect.get(target, key, receiver)
        }
      })
    },
    release() {
      fixatedDateTime = null
    }
  }

  const proxy = {}

  Object.defineProperty(proxy, 'DateTime', {
    value: new Proxy(luxon.DateTime, {
      get(target, key, receiver) {
        if (key === 'mock') return mock

        if (
          fixatedDateTime !== null &&
          (key === 'local' || /^from[A-Z].*$/.test(key))
        ) {
          return () => fixatedDateTime
        }

        return Reflect.get(target, key, receiver)
      }
    }),
    writable: true,
    enumerable: true,
    configurable: false
  })

  return shadow(luxon, proxy)
}
