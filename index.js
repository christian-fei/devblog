// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')
const logger = require('./lib/logger')

const MarkdownFile = require('./lib/files/markdown-file')
const GenericFile = require('./lib/files/generic-file')
const mkdir = require('./lib/mkdir')
const createConfig = require('./lib/create-config')

module.exports = {
  scan,
  build
}

async function scan (workingDirectory = process.cwd()) {
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
  const config = createConfig(absoluteWorkingDirectory)

  const filepaths = glob.sync(absoluteWorkingDirectory + '/**/*', {
    nodir: true,
    ignore: [
      'node_modules',
      'node_modules*',
      '.cache',
      'package.json',
      '.gitignore',
      '_includes',
      '_includes/*',
      '*_includes/*',
      '_site',
      '_site/*',
      '*_site/*'
    ]
      .map(i => `${absoluteWorkingDirectory}/${i}`)
  })
    .filter(f => !f.includes('_site'))
    .filter(f => !f.includes('node_modules'))

  const files = filepaths.map(f => toFile(f, absoluteWorkingDirectory, config))

  return { absoluteWorkingDirectory, filepaths, files, config, workingDirectory }
}

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

function toFile (sourceFilePath, absoluteWorkingDirectory, config) {
  if (sourceFilePath.endsWith('.md')) {
    return new MarkdownFile(sourceFilePath, absoluteWorkingDirectory, config)
  }
  return new GenericFile(sourceFilePath, absoluteWorkingDirectory)
}
