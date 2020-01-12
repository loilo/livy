const chalk = require('chalk')
let originalSupportsColor = chalk.supportsColor

module.exports = chalk
module.exports.__reset = () => {
  chalk.supportsColor = originalSupportsColor
}
