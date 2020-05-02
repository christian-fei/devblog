const fs = require('fs')

module.exports = function mkdir (pathToDir) {
  try {
    fs.mkdirSync(pathToDir, { recursive: true })
  } catch (err) { return err }
}
