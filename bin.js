#!/usr/bin/env node

const { scan, build, init } = require('.')
const path = require('path')
const print = require('./lib/print')
const createConfig = require('./lib/create-config')
const version = require('./package.json').version

if (require.main === module) {
  run(process.argv[2] || process.cwd(), process.argv[3] || process.cwd())
    .then(() => process.exit(0))
    .catch(err => console.error(err.message, err) && process.exit(1))
} else {
  module.exports = run
}

async function run (workingDirectoryOrCommand, workingDirectory) {
  let command = 'init'
  if (workingDirectoryOrCommand !== 'init') {
    workingDirectory = workingDirectoryOrCommand
    command = 'build'
  }
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
  const config = createConfig(absoluteWorkingDirectory)

  print.version(version)

  if (command === 'init') {
    await init(absoluteWorkingDirectory)
  }

  if (command === 'build') {
    console.log(`scanning ${absoluteWorkingDirectory.substring(absoluteWorkingDirectory.indexOf(workingDirectory))}`)
    const scanResult = await scan(workingDirectory, config)
    console.log(`${scanResult.filepaths.length} files found`)
    console.log(`processing files..`)

    const { errors, results } = await build(scanResult)
    print.buildResults(results)
    print.buildErrors(errors)
  }
}
