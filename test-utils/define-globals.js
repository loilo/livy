import { TEST_CONSTANTS } from './helpers/test-constants.js'
import { createRecord as record } from './helpers/create-record.js'
import { getMockedModule } from './helpers/get-mocked-module.js'
import { tick } from './helpers/tick.js'
import * as date from './mocks/fixate-date.js'
import { MockHandler } from './mocks/mock-handler.js'
import { MockFormatter } from './mocks/mock-formatter.js'
import { createMockProcessor } from './mocks/mock-processor.js'
import { MockLogger } from './mocks/mock-logger.js'

globalThis.livyTestGlobals = {
  TEST_CONSTANTS,
  record,
  date,
  tick,
  MockHandler,
  MockFormatter,
  createMockProcessor,
  MockLogger,
  getMockedModule
}
