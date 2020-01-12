// Don't warn that the fs.promises API is experimental as we're not using it
process.env.MEMFS_DONT_WARN = '1'

const { Volume } = require('memfs')
const { join } = require('path')

const fs = Volume.fromJSON({})

/**
 * Simple recursive directory delete to clear filesystem
 */
function clearFs(path = '/') {
  try {
    fs.rmdirSync(path)
  } catch (error) {
    if (error.code === 'ENOTDIR') {
      fs.unlinkSync(path)
      return
    }

    if (error.code === 'ENOTEMPTY') {
      for (const entry of fs.readdirSync(path)) {
        clearFs(join(path, entry))
      }
      fs.rmdirSync(path)
      return
    }
  }
}

fs.__reset = clearFs

module.exports = fs
module.exports.__esModule = true
