const fs = require('fs')
// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')
const nunjucks = require('nunjucks')
const { Remarkable } = require('remarkable')
const md = new Remarkable()
const mdToHTML = md.render.bind(md)
const logger = require('pino')()

module.exports = {
  scan,
  build
}

async function scan (basedir = process.cwd()) {
  const absoluteBasedir = path.resolve(basedir)
  const mdFiles = glob.sync(absoluteBasedir + '/**/*.md')

  return { absoluteBasedir, mdFiles }
}

async function build (absoluteBasedir, files = []) {
  const errors = []
  const written = []

  const _sitePath = absoluteBasedir + '/_site'

  mkdir(_sitePath)

  for (const file of files) {
    try {
      logger.debug('writing file', file)
      const mdContent = fs.readFileSync(file, { encoding: 'utf8' })
      const htmlContent = convertMdToHTML(mdContent)

      logger.debug('mdContent, htmlContent', `\n\n${mdContent}\n\n${htmlContent}`)

      const htmlFilePath = path.resolve(file
        .replace(absoluteBasedir, _sitePath)
        .replace(/\.md$/, '.html')
      )
      const htmlDirPath = path.resolve(htmlFilePath, '..')

      logger.info('creating htmlDirPath', htmlDirPath)
      mkdir(htmlDirPath)

      fs.writeFileSync(htmlFilePath, htmlContent, { encoding: 'utf8' })

      written.push(htmlFilePath)
    } catch (err) {
      errors.push({ err, message: err.message, file })
      logger.error(`failed writing file ${file}`, err.message)
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

function convertMdToHTML (mdContent) {
  let htmlContent = mdToHTML(mdContent)
  htmlContent = nunjucks.renderString(htmlContent, { author: 'test author' })
  return htmlContent
}
