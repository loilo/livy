/**
 * Get a Vitest mock callback based on a module factory file
 *
 * @param {Promise<{ default: () => any}>} path
 * @returns {(getOriginal: () => Promise<any>) => any}
 */
export function getMockedModule(factoryPromise) {
  return getOriginal =>
    factoryPromise.then(({ default: factory }) => factory(getOriginal))
}
