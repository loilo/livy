const os = jest.genMockFromModule('os')
os.EOL = '\n'
os.hostname = () => 'mock-hostname'

module.exports = os
module.exports.__esModule = true
