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
    this.destinationDirPath = path.resolve(this.destinationFilePath, '..')
    this.relativeDestination = this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    this.relativeSource = this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    this.dirPath = path.resolve(this.destinationFilePath, '..')
    this.url = this.sourceFilePath.replace(this.absoluteWorkingDirectory, '').replace(/\.md$/, '.html')
    this.collections = {}
    this.attributes = {}
    this.md = ''
    this.html = ''
  }

  setCollections (collections) { this.collections = collections }

  toJSON () {
    return Object.assign({}, {
      url: this.url,
      title: this.attributes.title,
      date: this.attributes.date,
      html: this.html,
      md: this.md
    }, {
      data: this.attributes
    })
  }

  async read () {
    let md = fs.readFileSync(this.sourceFilePath, { encoding: 'utf8' })

    const { attributes, bodyBegin } = parseFrontMatter(md)
    this.attributes = attributes

    const layout = attributes.layout
    if (bodyBegin > 0) md = removeFrontMatter(md, bodyBegin)

    this.md = md
    this.html = await this.toHTML({ layout }) || md

    return this
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

  async toHTML ({ layout }) {
    const initialHtmlContent = mdToHTML(this.md, {})
    let htmlContent = initialHtmlContent
    if (layout) {
      htmlContent = `{% extends '${layout}' %}${initialHtmlContent}`
    }

    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(this.includesDir)) // const env = nunjucks.configure(this.includesDir)

    if (Array.isArray(this.nunjucksFilters)) {
      this.nunjucksFilters
        .filter(Boolean)
        .filter(f => typeof f.name === 'string' && typeof f.filter === 'function')
        .forEach(f => env.addFilter(f.name, f.filter, !!f.async))
    }

    env.addGlobal('content', initialHtmlContent)
    env.addGlobal('title', this.attributes.title)
    env.addGlobal('page', this.toJSON())

    Object.keys(this.attributes).forEach(k => env.addGlobal(k, this.attributes[k]))

    const renderedContent = await new Promise((resolve, reject) => {
      nunjucks
        .compile(htmlContent, env)
        .render({
          // content: htmlContent,
          title: this.attributes.title,
          page: this.toJSON(),
          collections: this.collections
        }, (err, result) => {
          if (err) {
            return reject(err)
          }
          resolve(result)
        })
    })

    return renderedContent || initialHtmlContent
  }
}

function removeFrontMatter (md, bodyBegin) {
  return md.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
}
