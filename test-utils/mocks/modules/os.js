import { shadow } from '../../helpers/shadow.js'

export default async importOriginal => {
  const os = await importOriginal()

  return shadow(
    os,
    Object.seal({
      EOL: '\n',
      hostname: () => 'mock-hostname'
    })
  )
}
