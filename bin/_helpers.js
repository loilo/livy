/**
 * Get project root path
 *
 * @returns {string}
 */
async function getRoot() {
  let root
  if (typeof root === 'undefined') {
    const { fileURLToPath } = await import('node:url')
    const { dirname } = await import('path')
    const { findUpSync } = await import('find-up')

    root = dirname(
      findUpSync('package.json', {
        cwd: dirname(dirname(fileURLToPath(import.meta.url))),
      }),
    )
  }
  return root
}

/**
 * Get current minimist argv data
 */
async function getArgv() {
  let argv
  if (typeof argv === 'undefined') {
    argv = (await import('minimist')).default(process.argv.slice(2))
  }
  return argv
}

/**
 * Get projects packages path
 *
 * @returns {string}
 */
async function getPackagesDir() {
  let packagesDir
  if (typeof packagesDir === 'undefined') {
    const { join } = await import('node:path')

    packagesDir = join(await getRoot(), 'packages')
  }
  return packagesDir
}

/**
 * Get path to current package (from CWD or --package/-p flag)
 *
 * @returns {string}
 */
async function getPackageDir() {
  let packageName
  if (typeof packageName === 'undefined') {
    const { resolve, relative } = await import('node:path')

    const packagesDir = await getPackagesDir()
    const argv = await getArgv()
    const resolvedPackage = resolve(
      packagesDir,
      argv.package || argv.p || process.cwd(),
    )

    if (/^\.\.\/?/.test(relative(packagesDir, resolvedPackage))) {
      throw new Error(
        `Package "${resolvedPackage}" is not inside "packages" folder (${packagesDir})`,
      )
    }

    packageName = resolvedPackage
  }
  return packageName
}

const argv = await getArgv()

const [packagesDir, packageDir, root] = await Promise.all([
  getPackagesDir(),
  getPackageDir(),
  getRoot(),
])

export { argv, packagesDir, packageDir, root }
