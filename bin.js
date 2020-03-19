#!/usr/bin/env node

const { scan, build } = require('.')
const print = require('./lib/print')

if (require.main === module) {
  run(process.argv[2] || process.cwd())
    .then(() => process.exit(0))
    .catch(err => console.error(err.message, err) && process.exit(1))
} else {
  module.exports = run
}

async function run (workingDirectory) {
  const { absoluteWorkingDirectory, filepaths, files, config } = await scan(workingDirectory)
  print.scanResult({ absoluteWorkingDirectory, filepaths, workingDirectory })

  const { errors, results } = await build(absoluteWorkingDirectory, files, config)
  print.buildResults(results)
  print.buildErrors(errors)
}
