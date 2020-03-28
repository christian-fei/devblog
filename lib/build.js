const pLimit = require('p-limit')
const limit = pLimit(5)

const mkdir = require('./mkdir')

module.exports = build

async function build ({ absoluteWorkingDirectory, files = [], config = {} }) {
  mkdir(absoluteWorkingDirectory + '/_site')

  const errors = []
  const results = []
  await Promise.all(files.map((file) => limit(async () => file.write()
    .then(result => results.push(result))
    .catch((err) => errors.push({ err, message: err.message, sourceFilePath: file.sourceFilePath }))
  )))

  return {
    errors,
    results
  }
}
