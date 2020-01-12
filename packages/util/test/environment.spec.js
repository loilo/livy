jest.mock('os')

const environment = require('../src/environment')

describe('@livy/util/lib/environment', () => {
  test('isNodeJs', () => {
    expect(environment.isNodeJs).toBeTrue()
  })

  test('isBrowser', () => {
    expect(environment.isBrowser).toBeFalse()
  })

  test('EOL', () => {
    expect(environment.EOL).toBe('\n')
  })
})
