#!/usr/bin/env node

/**
 * Restore README files created with the `resolve-markdown-links` command
 */

import * as fs from 'node:fs'
import { resolve } from 'node:path'
import { packageDir, argv } from './_helpers.js'

const backupReadmePath = resolve(packageDir, '.BACKUP.README.md')
const readmePath = resolve(packageDir, 'README.md')

if (!fs.existsSync(backupReadmePath)) {
  if (argv.noBail || agv.n) {
    process.exit(0)
  }

  console.error(`No .BACKUP.README.md found in ${packageDir}`)
  process.exit(1)
}

fs.renameSync(backupReadmePath, readmePath)
