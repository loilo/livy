import { defineConfig } from 'vitest/config'
import { vitestConfig } from '@livy/test-utils/vitest-config.js'
import { defu } from 'defu'

export default defineConfig(
  defu(
    {
      test: {
        environment: 'jsdom'
      }
    },
    vitestConfig
  )
)
