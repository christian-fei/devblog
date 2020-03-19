// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')
const logger = require('./lib/logger')

const MarkdownFile = require('./lib/markdown-file')
const GenericFile = require('./lib/generic-file')
const mkdir = require('./lib/mkdir')

module.exports = {
  scan,
  build
}

async function scan (workingDirectory = process.cwd()) {
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
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

  return { absoluteWorkingDirectory, filepaths, workingDirectory }
}

async function build (absoluteWorkingDirectory, filepaths = [], config = {}) {
  const errors = []
  const results = []

  const _sitePath = absoluteWorkingDirectory + '/_site'

  mkdir(_sitePath)

  for (const sourceFilePath of filepaths) {
    try {
      if (sourceFilePath.endsWith('.md')) {
        const file = new MarkdownFile(sourceFilePath, absoluteWorkingDirectory, config)
        logger.debug('writing markdown file', file)
        results.push(await file.write())
        continue
      }

      const file = new GenericFile(sourceFilePath, absoluteWorkingDirectory)
      logger.debug('writing generic file', file)
      results.push(await file.write())
      continue
    } catch (err) {
      errors.push({ err, message: err.message, sourceFilePath })
      logger.trace(`failed writing file ${sourceFilePath}`, err.message, err)
    }
  }

  return {
    errors,
    results
  }
}
