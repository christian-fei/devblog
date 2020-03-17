const fs = require('fs')
// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')
const nunjucks = require('nunjucks')
const parseFrontMatter = require('front-matter')
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
  const files = glob.sync(absoluteBasedir + '/**/*.md')

  return { absoluteBasedir, files }
}

class MarkdownFile {
  constructor (filepath, absoluteBasedir) {
    this.filepath = filepath
    this.absoluteBasedir = absoluteBasedir
    this._sitePath = absoluteBasedir + '/_site'
  }

  read () {
    return fs.readFileSync(this.filepath, { encoding: 'utf8' })
  }

  render () {
    const file = this.filepath
    const absoluteBasedir = this.absoluteBasedir
    const _sitePath = this._sitePath
    let mdContent = this.read()
    const { attributes, bodyBegin } = parseFrontMatter(mdContent)

    if (bodyBegin > 0) {
      mdContent = mdContent.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
    }
    const htmlContent = convertMdToHTML(mdContent, absoluteBasedir + '/_includes')
    logger.debug('mdContent, htmlContent', `\n\n${mdContent}\n\n${htmlContent}`)

    const htmlFilePath = path.resolve(file
      .replace(absoluteBasedir, _sitePath)
      .replace(/\.md$/, '.html')
    )
    const htmlDirPath = path.resolve(htmlFilePath, '..')

    logger.debug('creating htmlDirPath', htmlDirPath)
    mkdir(htmlDirPath)

    fs.writeFileSync(htmlFilePath, htmlContent, { encoding: 'utf8' })

    logger.info(`written`, htmlContent.length, htmlFilePath)

    return {
      htmlFilePath, htmlContent, mdContent, attributes
    }
  }
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
        written.push(file.render())
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

function convertMdToHTML (mdContent, includesDir = '_includes') {
  const htmlContent = mdToHTML(mdContent)
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(includesDir))

  const renderedContent = nunjucks
    .compile(htmlContent, env)
    .render({ author: 'test author', content: mdContent })

  logger.debug({ includesDir, htmlContent, mdContent, renderedContent })
  return renderedContent
}
