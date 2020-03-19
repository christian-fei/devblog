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

async function scan (basedir = process.cwd()) {
  const absoluteBasedir = path.resolve(basedir)
  const files = glob.sync(absoluteBasedir + '/**/*', {
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
      .map(i => `${absoluteBasedir}/${i}`)
  })
    .filter(f => !f.includes('_site'))
    .filter(f => !f.includes('node_modules'))

  return { absoluteBasedir, files, basedir }
}

async function build (absoluteBasedir, files = [], config = {}) {
  const errors = []
  const results = []

  const _sitePath = absoluteBasedir + '/_site'

  mkdir(_sitePath)

  for (const sourceFilePath of files) {
    try {
      if (sourceFilePath.endsWith('.md')) {
        const file = new MarkdownFile(sourceFilePath, absoluteBasedir, config)
        logger.debug('writing markdown file', file)
        results.push(await file.write())
        continue
      }

      const file = new GenericFile(sourceFilePath, absoluteBasedir)
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
