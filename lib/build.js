const logger = require('./logger')
const pLimit = require('p-limit')
const limit = pLimit(5)

const mkdir = require('./mkdir')

module.exports = build

async function build ({ absoluteWorkingDirectory, files = [], config = {} }) {
  mkdir(absoluteWorkingDirectory + '/_site')

  const errors = []
  const results = []
  await Promise.all(files.map((file) => limit(async () => {
    try {
      results.push(await file.write())
      console.log(file.relativeSource, '\n created', file.relativeDestination)
    } catch (err) {
      errors.push({ err, message: err.message, sourceFilePath: file.sourceFilePath })
      logger.trace(`failed writing file ${file.sourceFilePath}`, err.message, err)
    }
  })))

  return {
    errors,
    results
  }
}
