const fs = require('fs')
const logger = require('./logger')

module.exports = function mkdir (pathToDir) {
  try {
    fs.mkdirSync(pathToDir, { recursive: true })
  } catch (err) { logger.trace('failed to create', pathToDir, err.message, err); return err }
}
