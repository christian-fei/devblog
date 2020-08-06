#!/usr/bin/env node

const { scan, build, init, save } = require('.')
const path = require('path')
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

  console.log(`devblog version ${version}`)

  if (command === 'init') {
    await init(absoluteWorkingDirectory)
  }

  console.log(`scanning ${absoluteWorkingDirectory.substring(absoluteWorkingDirectory.indexOf(workingDirectory))}`)
  const scanResult = await scan(workingDirectory, config)

  console.log(`${scanResult.filepaths.length} files found`)
  console.log('processing files..')

  const { errors, results } = await build(scanResult)
  if (results.length === 0) {
    console.info('⚠️ no files created')
  }

  if (errors.length > 0) {
    console.error('errors: ')
    console.error(errors.map(e => `🚫 ${e.sourceFilePath}\n${e.message}`).join('\n'))
  }

  await save(absoluteWorkingDirectory, scanResult)

}
