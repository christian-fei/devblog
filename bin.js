#!/usr/bin/env node

const { scan, build } = require('.')
const print = require('./lib/print')
const version = require('./package.json').version

if (require.main === module) {
  run(process.argv[2] || process.cwd())
    .then(() => process.exit(0))
    .catch(err => console.error(err.message, err) && process.exit(1))
} else {
  module.exports = run
}

async function run (workingDirectory) {
  print.version(version)
  const scanResult = await scan(workingDirectory)
  print.scanResult(scanResult)

  const { errors, results } = await build(scanResult)
  print.buildResults(results)
  print.buildErrors(errors)
}
