module.exports = {
  testMatch: ['<rootDir>/packages/*/test/**/*.spec.js'],
  setupFiles: ['./test/__helpers__/setup.js'],
  setupFilesAfterEnv: ['jest-extended'],
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default',
  collectCoverageFrom: ['packages/*/src/**/*.ts']
}
