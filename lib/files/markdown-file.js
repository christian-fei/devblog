const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')
const parseFrontMatter = require('front-matter')
const { Remarkable } = require('remarkable')
const md = new Remarkable({ html: true })
const mdToHTML = md.render.bind(md)
const logger = require('../logger')
const mkdir = require('../mkdir')

module.exports = class MarkdownFile {
  constructor (sourceFilePath, absoluteWorkingDirectory, { nunjucksFilters = [] } = {}) {
    this.sourceFilePath = sourceFilePath
    this.absoluteWorkingDirectory = absoluteWorkingDirectory
    this.nunjucksFilters = nunjucksFilters
    this._sitePath = absoluteWorkingDirectory + '/_site'
    this.includesDir = [this.absoluteWorkingDirectory, this.absoluteWorkingDirectory + '/_includes']
    this.destinationFilePath = path.resolve(this.sourceFilePath.replace(this.absoluteWorkingDirectory, this._sitePath).replace(/\.md$/, '.html'))
    this.dirPath = path.resolve(this.destinationFilePath, '..')
  }

  async read () {
    let md = fs.readFileSync(this.sourceFilePath, { encoding: 'utf8' })
    const { attributes, bodyBegin } = parseFrontMatter(md)
    const layout = attributes.layout
    if (bodyBegin > 0) md = removeFrontMatter(md, bodyBegin)
    const html = await renderMdWithLayout({
      md,
      layout,
      nunjucksFilters: this.nunjucksFilters,
      attributes,
      includesDir: this.includesDir,
      sourceFilePath: this.sourceFilePath,
      absoluteWorkingDirectory: this.absoluteWorkingDirectory
    }) || md

    return { md, html, attributes }
  }

  async write () {
    const { html, attributes } = await this.read()

    mkdir(this.dirPath)
    fs.writeFileSync(this.destinationFilePath, html, { encoding: 'utf8' })
    const size = fs.statSync(this.sourceFilePath).size

    logger.debug(`write markdown file results`, size, this.destinationFilePath)

    return {
      additional: { size, attributes },
      destinationFilePath: this.destinationFilePath,
      source: this.sourceFilePath,
      relativeDestination: this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', ''),
      relativeSource: this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    }
  }
}

function removeFrontMatter (md, bodyBegin) {
  return md.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
}

async function renderMdWithLayout ({ md, attributes, layout, nunjucksFilters, includesDir = '_includes', sourceFilePath, absoluteWorkingDirectory }) {
  const initialHtmlContent = mdToHTML(md, { html: true })
  let htmlContent = initialHtmlContent
  if (layout) {
    htmlContent = `{% extends '${layout}' %}{% block content %}${initialHtmlContent}{% endblock %}`
  }

  const url = sourceFilePath.replace(absoluteWorkingDirectory, '')

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
          date: attributes.date,
          data: attributes,
          content: htmlContent
        },
        collections: {
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
