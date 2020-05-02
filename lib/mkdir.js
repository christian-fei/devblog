const fs = require('fs')

module.exports = function mkdir (pathToDir) {
  try {
    fs.mkdirSync(pathToDir, { recursive: true })
  } catch (err) { console.error('failed to create', pathToDir, err.message, err); return err }
}
