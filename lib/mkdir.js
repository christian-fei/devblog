const fs = require('fs')
const logger = require('pino')()

module.exports = function mkdir (pathToDir) {
  try {
    fs.mkdirSync(pathToDir, { recursive: true })
  } catch (err) { logger.error('failed to create', pathToDir, err.message, err); return err }
}
