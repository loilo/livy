import { vi } from 'vitest'

// TODO: Modules have been mocked in very different ways with very different
// conventions for naming etc. This should be unified someday.

// ATTENTION! Moving mocks of external dependencies below mocks
// of Node.js modules somehow breaks the tests.

vi.mock(
  'chalk',
  livyTestGlobals.getMockedModule(import('./mocks/modules/chalk.js')),
)
vi.mock(
  'got',
  livyTestGlobals.getMockedModule(import('./mocks/modules/got.js')),
)
vi.mock(
  'luxon',
  livyTestGlobals.getMockedModule(import('./mocks/modules/luxon.js')),
)

vi.mock('fs', livyTestGlobals.getMockedModule(import('./mocks/modules/fs.js')))
vi.mock(
  'node:fs',
  livyTestGlobals.getMockedModule(import('./mocks/modules/fs.js')),
)
vi.mock(
  'net',
  livyTestGlobals.getMockedModule(import('./mocks/modules/net.js')),
)
vi.mock(
  'node:net',
  livyTestGlobals.getMockedModule(import('./mocks/modules/net.js')),
)
vi.mock('os', livyTestGlobals.getMockedModule(import('./mocks/modules/os.js')))
vi.mock(
  'node:os',
  livyTestGlobals.getMockedModule(import('./mocks/modules/os.js')),
)
vi.mock(
  'tls',
  livyTestGlobals.getMockedModule(import('./mocks/modules/tls.js')),
)
vi.mock(
  'node:tls',
  livyTestGlobals.getMockedModule(import('./mocks/modules/tls.js')),
)
