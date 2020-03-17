const fs = require('fs')
// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')
const { Remarkable } = require('remarkable')
const md = new Remarkable()
const render = md.render.bind(md)
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

async function build (files = []) {
  const errors = []
  const succeeded = []

  for (const file of files) {
    try {
      logger.debug('writing file', file)
      const md = fs.readFileSync(file, { encoding: 'utf8' })
      const html = render(md)
      logger.debug('md, html', `\n\n${md}\n\n${html}`)
      const htmlFilePath = path.resolve(file.replace(/\.md$/, '.html'))
      fs.writeFileSync(htmlFilePath, html, { encoding: 'utf8' })
      succeeded.push(htmlFilePath)
    } catch (err) {
      errors.push({ err, message: err.message, file })
      logger.error(`failed writing file ${file}`, err.message)
    }
  }

  return {
    errors,
    succeeded
  }
}
