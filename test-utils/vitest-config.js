import { defineConfig } from 'vitest/config'

export const vitestConfig = defineConfig({
  test: {
    setupFiles: ['@livy/test-utils/setup.js'],
    include: ['./test/**/*.spec.js']
  }
})
