const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')
const parseFrontMatter = require('front-matter')
const { Remarkable } = require('remarkable')
const md = new Remarkable()
const mdToHTML = md.render.bind(md)
const logger = require('pino')()
const mkdir = require('./mkdir')

module.exports = class MarkdownFile {
  constructor (filepath, absoluteBasedir) {
    this.filepath = filepath
    this.absoluteBasedir = absoluteBasedir
    this._sitePath = absoluteBasedir + '/_site'
    this.htmlPath = path.resolve(this.filepath.replace(this.absoluteBasedir, this._sitePath).replace(/\.md$/, '.html'))
    this.dirPath = path.resolve(this.htmlPath, '..')
  }

  read () {
    let md = fs.readFileSync(this.filepath, { encoding: 'utf8' })
    const { attributes, bodyBegin } = parseFrontMatter(md)
    const layout = attributes.layout
    if (bodyBegin > 0) md = removeFrontMatter(md, bodyBegin)
    const html = renderMdWithLayout(md, layout, this.absoluteBasedir + '/_includes')

    function renderMdWithLayout (mdContent, layout, includesDir = '_includes') {
      let htmlContent = mdToHTML(mdContent)
      if (layout) {
        logger.debug('applying layout', layout)
        htmlContent = `{% extends '${layout}' %}{% block content %}${htmlContent}{% endblock %}`
      }
      const env = new nunjucks.Environment(new nunjucks.FileSystemLoader([includesDir])) // const env = nunjucks.configure(includesDir)
      const renderedContent = nunjucks
        .compile(htmlContent, env)
        .render({ author: 'test author', content: htmlContent })

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

function removeFrontMatter (md, bodyBegin) {
  return md.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
}
