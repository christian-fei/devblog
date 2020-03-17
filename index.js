const fs = require('fs')
// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')
const MarkdownFile = require('./lib/markdown-file')
const logger = require('pino')()

module.exports = {
  scan,
  build
}

async function scan (basedir = process.cwd()) {
  const absoluteBasedir = path.resolve(basedir)
  const files = glob.sync(absoluteBasedir + '/**/*.md')

  return { absoluteBasedir, files }
}

async function build (absoluteBasedir, files = []) {
  const errors = []
  const written = []

  const _sitePath = absoluteBasedir + '/_site'

  mkdir(_sitePath)

  for (const filepath of files) {
    try {
      if (filepath.endsWith('.md')) {
        const file = new MarkdownFile(filepath, absoluteBasedir)
        logger.debug('writing file', file)
        written.push(file.write())
        continue
      }
      logger.debug(`unhandled ${filepath}`)
    } catch (err) {
      errors.push({ err, message: err.message, filepath })
      logger.error(`failed writing file ${filepath}`, err.message)
    }
  }

  return {
    errors,
    written
  }
}

function mkdir (pathToDir) {
  try {
    fs.mkdirSync(pathToDir, { recursive: true })
  } catch (err) { logger.error('failed to create _site', pathToDir, err.message, err); return err }
}
