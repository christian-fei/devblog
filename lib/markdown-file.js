const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')
const parseFrontMatter = require('front-matter')
const { Remarkable } = require('remarkable')
const md = new Remarkable({ html: true })
const mdToHTML = md.render.bind(md)
const logger = require('./logger')
const mkdir = require('./mkdir')

module.exports = class MarkdownFile {
  constructor (filepath, absoluteBasedir) {
    this.filepath = filepath
    this.absoluteBasedir = absoluteBasedir
    this._sitePath = absoluteBasedir + '/_site'
    this.includesDir = [this.absoluteBasedir, this.absoluteBasedir + '/_includes']
    this.htmlPath = path.resolve(this.filepath.replace(this.absoluteBasedir, this._sitePath).replace(/\.md$/, '.html'))
    this.dirPath = path.resolve(this.htmlPath, '..')
  }

  read () {
    let md = fs.readFileSync(this.filepath, { encoding: 'utf8' })
    const { attributes, bodyBegin } = parseFrontMatter(md)
    const layout = attributes.layout
    if (bodyBegin > 0) md = removeFrontMatter(md, bodyBegin)
    const html = renderMdWithLayout({
      md,
      layout,
      attributes,
      includesDir: this.includesDir,
      filepath: this.filepath,
      absoluteBasedir: this.absoluteBasedir
    })
    // if (!html) html = md

    return { md, html, attributes }
  }

  write () {
    const { html } = this.read()

    mkdir(this.dirPath)
    fs.writeFileSync(this.htmlPath, html, { encoding: 'utf8' })
    logger.debug(`results`, html.length, this.htmlPath)

    return this.htmlPath
  }
}

function removeFrontMatter (md, bodyBegin) {
  return md.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
}

function renderMdWithLayout ({ md, attributes, layout, includesDir = '_includes', filepath, absoluteBasedir }) {
  let htmlContent = mdToHTML(md, { html: true })
  if (layout) {
    htmlContent = `{% extends '${layout}' %}{% block content %}${htmlContent}{% endblock %}`
  }

  const url = filepath.replace(absoluteBasedir, '')

  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(includesDir)) // const env = nunjucks.configure(includesDir)
  const renderedContent = nunjucks
    .compile(htmlContent, env)
    .render({
      content: htmlContent,
      title: attributes.title,
      data: attributes,
      page: {
        url,
        data: attributes,
        content: htmlContent
      }
    })

  return renderedContent || htmlContent
}
