#!/usr/bin/env node

const { scan, build } = require('.')
const createConfig = require('./lib/create-config')
const print = require('./lib/print')

if (require.main === module) {
  run(process.argv[2] || process.cwd())
    .then(() => process.exit(0))
    .catch(err => console.error(err.message, err) && process.exit(1))
} else {
  module.exports = run
}

async function run (pathParam) {
  const { absoluteWorkingDirectory, filepaths } = await scan(pathParam)
  print.scanResult({ absoluteWorkingDirectory, filepaths, pathParam })

  const config = createConfig(absoluteWorkingDirectory)
  const { errors, results } = await build(absoluteWorkingDirectory, filepaths, config)
  print.buildResults(results)
  print.buildErrors(errors)
}
