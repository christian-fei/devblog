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
    this.htmlPath = path.resolve(this.filepath
      .replace(this.absoluteBasedir, this._sitePath)
      .replace(/\.md$/, '.html')
    )
    this.dirPath = path.resolve(this.htmlPath, '..')
  }

  read () {
    let md = fs.readFileSync(this.filepath, { encoding: 'utf8' })
    const { attributes, bodyBegin } = parseFrontMatter(md)
    if (bodyBegin > 0) {
      md = md.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
    }
    const html = convertMdToHTML(md, this.absoluteBasedir + '/_includes')

    function convertMdToHTML (mdContent, includesDir = '_includes') {
      const htmlContent = mdToHTML(mdContent)
      const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(includesDir))
      // const env = nunjucks.configure(includesDir)

      const renderedContent = nunjucks
        .compile(htmlContent, env)
        .render({ author: 'test author' })

      logger.debug({ includesDir, htmlContent, mdContent, renderedContent })
      return renderedContent
    }

    return { md, html, attributes }
  }

  write () {
    const { md, html, attributes } = this.read()
    logger.debug('md, html', `\n\n${md}\n\n${html}`)
    logger.debug('attributes', attributes)

    mkdir(this.dirPath)
    fs.writeFileSync(this.htmlPath, html, { encoding: 'utf8' })
    logger.info(`written`, html.length, this.htmlPath)

    return this.htmlPath
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
