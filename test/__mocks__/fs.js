// Don't warn that the fs.promises API is experimental as we're not using it
process.env.MEMFS_DONT_WARN = '1'

const { Volume, createFsFromVolume } = require('memfs')

const volume = new Volume()

const fs = createFsFromVolume(volume)

fs.__reset = () => {
  volume.reset()
}
fs.toJSON = () => volume.toJSON()

module.exports = fs
module.exports.__esModule = true
