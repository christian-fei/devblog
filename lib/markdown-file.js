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
  constructor (filepath, absoluteBasedir, { nunjucksFilters = [] } = {}) {
    this.filepath = filepath
    this.absoluteBasedir = absoluteBasedir
    this.nunjucksFilters = nunjucksFilters
    this._sitePath = absoluteBasedir + '/_site'
    this.includesDir = [this.absoluteBasedir, this.absoluteBasedir + '/_includes']
    this.htmlPath = path.resolve(this.filepath.replace(this.absoluteBasedir, this._sitePath).replace(/\.md$/, '.html'))
    this.dirPath = path.resolve(this.htmlPath, '..')
  }

  async read () {
    let md = fs.readFileSync(this.filepath, { encoding: 'utf8' })
    const { attributes, bodyBegin } = parseFrontMatter(md)
    const layout = attributes.layout
    if (bodyBegin > 0) md = removeFrontMatter(md, bodyBegin)
    const html = await renderMdWithLayout({
      md,
      layout,
      nunjucksFilters: this.nunjucksFilters,
      attributes,
      includesDir: this.includesDir,
      filepath: this.filepath,
      absoluteBasedir: this.absoluteBasedir
    }) || md

    return { md, html, attributes }
  }

  async write () {
    const { html } = await this.read()

    mkdir(this.dirPath)
    fs.writeFileSync(this.htmlPath, html, { encoding: 'utf8' })
    logger.debug(`results`, html.length, this.htmlPath)

    return this.htmlPath
  }
}

function removeFrontMatter (md, bodyBegin) {
  return md.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
}

async function renderMdWithLayout ({ md, attributes, layout, nunjucksFilters, includesDir = '_includes', filepath, absoluteBasedir }) {
  const initialHtmlContent = mdToHTML(md, { html: true })
  let htmlContent = initialHtmlContent
  if (layout) {
    htmlContent = `{% extends '${layout}' %}{% block content %}${initialHtmlContent}{% endblock %}`
  }

  const url = filepath.replace(absoluteBasedir, '')

  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(includesDir)) // const env = nunjucks.configure(includesDir)

  if (Array.isArray(nunjucksFilters)) {
    nunjucksFilters
      .filter(Boolean)
      .filter(f => typeof f.name === 'string' && typeof f.filter === 'function')
      .forEach(f => env.addFilter(f.name, f.filter, !!f.async))
  }

  const renderedContent = await new Promise((resolve, reject) => {
    nunjucks
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
      }, (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      })
  })

  return renderedContent || initialHtmlContent
}
