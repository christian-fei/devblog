#!/usr/bin/env node

const { scan, build, init, save } = require('.')
const path = require('path')
const createConfig = require('./lib/create-config')
const version = require('./package.json').version

if (require.main === module) {
  run(process.argv)
    .then(() => process.exit(0))
    .catch(err => console.error(err.message, err) && process.exit(1))
} else {
  module.exports = run
}

async function run (argv = process.argv) {
  const workingDirectoryOrCommand = argv[2] || process.cwd()
  let workingDirectory = argv[3] || process.cwd()
  let command = 'init'
  if (workingDirectoryOrCommand !== 'init') {
    workingDirectory = workingDirectoryOrCommand
    command = 'build'
  }
  const toCache = argv.includes('--cache')
  const toDebug = process.env.DEBUG === 'true'
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
  const config = createConfig(absoluteWorkingDirectory)

  console.log(`devblog version ${version}`)

  if (command === 'init') {
    await init(absoluteWorkingDirectory)
  }

  console.log(`scanning ${absoluteWorkingDirectory.substring(absoluteWorkingDirectory.indexOf(workingDirectory))}`)
  toDebug && console.time('scan')
  const scanResult = await scan(workingDirectory, config)
  toDebug && console.timeEnd('scan')

  console.log(`${scanResult.filepaths.length} files found`)
  console.log('processing files..')

  toDebug && console.time('build')
  const { errors, results } = await build(scanResult)
  toDebug && console.timeEnd('build')
  if (results.length === 0) {
    console.info('⚠️ no files created')
  }

  if (errors.length > 0) {
    console.error('errors: ')
    console.error(errors.map(e => `🚫 ${e.sourceFilePath}\n${e.message}`).join('\n'))
  }

  if (toCache) {
    toDebug && console.time('save')
    await save(absoluteWorkingDirectory, scanResult)
    toDebug && console.timeEnd('save')
  }
}
