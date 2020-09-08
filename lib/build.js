const pLimit = require('p-limit')
const limit = pLimit(require('os').cpus().length * 2)

const mkdir = require('./mkdir')

module.exports = build

async function build ({ absoluteWorkingDirectory, files = [], config = {} }) {
  mkdir(absoluteWorkingDirectory + '/_site')

  const errors = []
  const results = []
  const tasks = files.map((file) => limit(async () => file.write()
    .then(result => results.push(result))
    .catch((err) => errors.push({ err, message: err.message, sourceFilePath: file.sourceFilePath }))
  ))
  await Promise.all(tasks)

  return {
    errors,
    results
  }
}
