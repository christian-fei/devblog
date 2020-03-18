// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')
const logger = require('./lib/logger')

const MarkdownFile = require('./lib/markdown-file')
const mkdir = require('./lib/mkdir')

module.exports = {
  scan,
  build
}

async function scan (basedir = process.cwd()) {
  const absoluteBasedir = path.resolve(basedir)
  const files = glob.sync(absoluteBasedir + '/**/*.md')

  return { absoluteBasedir, files, basedir }
}

async function build (absoluteBasedir, files = []) {
  const errors = []
  const results = []

  const _sitePath = absoluteBasedir + '/_site'

  mkdir(_sitePath)

  for (const filepath of files) {
    try {
      if (filepath.endsWith('.md')) {
        const file = new MarkdownFile(filepath, absoluteBasedir)
        logger.debug('writing file', file)
        const destination = file.write()
        results.push({
          destination,
          source: filepath,
          relativeDestination: destination.replace(absoluteBasedir + '/', ''),
          relativeSource: filepath.replace(absoluteBasedir + '/', '')
        })
        continue
      }
      logger.debug(`unhandled ${filepath}`)
    } catch (err) {
      errors.push({ err, message: err.message, filepath })
      logger.error(`failed writing file ${filepath}`, err.message)
      console.error(err)
    }
  }

  return {
    errors,
    results
  }
}
