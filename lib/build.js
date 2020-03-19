const logger = require('./logger')

const mkdir = require('./mkdir')

module.exports = build

async function build (absoluteWorkingDirectory, files = [], config = {}) {
  const errors = []
  const results = []

  const _sitePath = absoluteWorkingDirectory + '/_site'

  mkdir(_sitePath)

  for (const file of files) {
    try {
      results.push(await file.write())
    } catch (err) {
      errors.push({ err, message: err.message, sourceFilePath: file.sourceFilePath })
      logger.trace(`failed writing file ${file.sourceFilePath}`, err.message, err)
    }
  }

  return {
    errors,
    results
  }
}
