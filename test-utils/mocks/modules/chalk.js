import { shadow } from '../../helpers/shadow.js'

export default async importOriginal => {
  const chalk = await importOriginal('chalk')
  const originalSupportsColor = chalk.supportsColor

  const proxy = Object.seal({
    supportsColor: chalk.supportsColor,
    default: shadow(
      chalk.default,
      Object.seal({
        __reset() {
          Object.assign(proxy.supportsColor, originalSupportsColor)
        }
      })
    )
  })

  return shadow(chalk, proxy)
}
