/**
 * Get project root path
 *
 * @returns {string}
 */
function getRoot() {
  let root
  if (typeof root === 'undefined') {
    const { dirname } = require('path')
    const findUp = require('find-up')

    root = dirname(
      findUp.sync('package.json', {
        cwd: dirname(__dirname)
      })
    )
  }
  return root
}

/**
 * Get current minimist argv data
 *
 * @returns {string}
 */
function getArgv() {
  let argv
  if (typeof argv === 'undefined') {
    argv = require('minimist')(process.argv.slice(2))
  }
  return argv
}

/**
 * Get projects packages path
 *
 * @returns {string}
 */
function getPackagesDir() {
  let packagesDir
  if (typeof packagesDir === 'undefined') {
    const { join } = require('path')

    packagesDir = join(getRoot(), 'packages')
  }
  return packagesDir
}

/**
 * Get path to current package (from CWD or --package/-p flag)
 *
 * @returns {string}
 */
function getPackageDir() {
  let package
  if (typeof package === 'undefined') {
    const { resolve, relative } = require('path')

    const resolvedPackage = resolve(
      getPackagesDir(),
      getArgv().package || getArgv().p || process.cwd()
    )

    if (/^\.\.\/?/.test(relative(getPackagesDir(), resolvedPackage))) {
      throw new Error(
        `Package "${resolvedPackage}" is not inside "packages" folder (${getPackagesDir()})`
      )
    }

    package = resolvedPackage
  }
  return package
}

Object.defineProperties(exports, {
  argv: { get: getArgv },
  root: { get: getRoot },
  packagesDir: { get: getPackagesDir },
  packageDir: { get: getPackageDir }
})
