import { Volume, createFsFromVolume } from 'memfs'

const volume = new Volume()
const fs = createFsFromVolume(volume)

export default () => {
  return {
    ...fs,
    toJSON: () => volume.toJSON(),
    __reset: () => volume.reset()
  }
}
