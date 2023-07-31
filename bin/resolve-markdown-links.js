#!/usr/bin/env node

/**
 * Resolve links in README.md files for correct usage on npm
 *
 * This is needed because npm currently fails to properly resolve some relative
 * links (e.g. to the livy root repository or to files).
 */

import { relative, resolve } from 'node:path'
import * as fs from 'node:fs'
import { remark } from 'remark'
import { root, packageDir } from './_helpers.js'

function resolveRelativeLinks() {
  return function traverse(node) {
    if (
      node.type === 'link' &&
      !/^https?:\/\//.test(node.url) &&
      !/^#/.test(node.url)
    ) {
      const resolvedUrl = resolve(packageDir, node.url)
      const relativeUrl = relative(root, resolvedUrl)

      const packageMatch = relativeUrl.match(
        /^packages\/([^/?#]+)\/README\.md(#.+)?$/,
      )
      if (packageMatch) {
        // Package readme
        const [, packageName, hash] = packageMatch
        node.url = `https://npmjs.com/package/@livy/${packageName}${hash || ''}`
      } else if (relativeUrl.startsWith('README.md')) {
        // Root readme
        const [, hash] = relativeUrl.match(/(#.+)?$/)
        node.url = `https://github.com/loilo/livy${hash || ''}`
      } else {
        // Any other file
        node.url = `https://github.com/loilo/livy/tree/master/${relativeUrl}`
      }
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach(traverse)
    }
  }
}

const readmePath = resolve(packageDir, 'README.md')
const backupReadmePath = resolve(packageDir, '.BACKUP.README.md')

if (fs.existsSync(backupReadmePath)) {
  console.error(
    `.BACKUP.README.md already exists in ${packageDir}. Restore or delete it before modifying the README.md`,
  )
  process.exit(1)
}

fs.copyFileSync(readmePath, backupReadmePath)

if (!fs.existsSync(readmePath)) {
  console.error(`No README.md found in ${packageDir}`)
  process.exit(1)
}

const originalContent = fs.readFileSync(readmePath, 'utf8')

try {
  const file = await remark()
    .use({
      settings: {
        listItemIndent: '1',
        rule: '-',
        ruleSpaces: false,
      },
    })
    .use(resolveRelativeLinks)
    .process(originalContent)

  fs.writeFileSync(readmePath, String(file))
} catch (error) {
  console.error(String(error))
  process.exit(1)
}
