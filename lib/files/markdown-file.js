const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const nunjucks = require('nunjucks')
const parseFrontMatter = require('front-matter')
const { Remarkable } = require('remarkable')
const { linkify } = require('remarkable/linkify')
const md = new Remarkable({ html: true }).use(linkify)
const mdToHTML = md.render.bind(md)
const minify = require('html-minifier').minify
const mkdir = require('../mkdir')

module.exports = class MarkdownFile {
  constructor ({ sourceFilePath, absoluteWorkingDirectory, config = { nunjucksFilters: [], collections: {} } } = {}) {
    this.sourceFilePath = sourceFilePath
    this.absoluteWorkingDirectory = absoluteWorkingDirectory
    this.nunjucksFilters = config.nunjucksFilters
    this._sitePath = absoluteWorkingDirectory + '/_site'
    this.includesDir = [this.absoluteWorkingDirectory, this.absoluteWorkingDirectory + '/_includes']
    this.destinationFilePath = path.resolve(this.sourceFilePath.replace(this.absoluteWorkingDirectory, this._sitePath).replace(/\.md$/, '.html').replace(/\.njk$/, '.html'))
    this.destinationDirPath = path.resolve(this.destinationFilePath, '..')
    this.relativeDestination = this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    this.relativeSource = this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    this.dirPath = path.resolve(this.destinationFilePath, '..')
    this.url = this.sourceFilePath.replace(this.absoluteWorkingDirectory, '').replace(/\.md$/, '/').replace(/\.njk$/, '/').replace(/index\/$/, '')
    this.collections = config.collections
    this.attributes = {}
    this.md = ''
    this.html = ''
  }

  setCollections (collections) { this.collections = collections }

  toJSON () {
    return Object.assign({}, this, {
      data: this.attributes
    }, {
      nunjucksFilters: undefined,
      collections: undefined
    })
  }

  async read () {
    let md = fs.readFileSync(this.sourceFilePath, { encoding: 'utf8' })

    const { attributes, bodyBegin } = parseFrontMatter(md)
    this.attributes = attributes
    if (this.attributes && this.attributes.dest) {
      this.relativeDestination = this.attributes.dest
      this.destinationFilePath = path.resolve(this._sitePath, this.relativeDestination)
      this.destinationDirPath = path.resolve(this.destinationFilePath, '..')
    }

    const layout = attributes.layout
    if (bodyBegin > 0) md = removeFrontMatter(md, bodyBegin)

    this.md = md
    this.htmlContent = mdToHTML(this.md, {})
    this.html = await this.toHTML({ layout }) || md
    this.hash = crypto.createHash('md5').update(this.html).digest('hex')

    return this
  }

  async write () {
    const { html } = await this.read()

    if (fs.existsSync(this.destinationFilePath)) {
      const existingContent = fs.readFileSync(this.destinationFilePath)
      const destinationHash = crypto.createHash('md5').update(existingContent).digest('hex')

      if (this.hash === destinationHash) {
        console.log('unchanged', this.relativeDestination, destinationHash)
        return Object.assign({ unchanged: true }, this.toJSON())
      }
    }

    mkdir(this.dirPath)
    fs.writeFileSync(this.destinationFilePath, html, { encoding: 'utf8' })

    if (!this.destinationFilePath.endsWith('index.html')) {
      mkdir(this.destinationFilePath.replace(/\.html$/, '/'))
      fs.writeFileSync(this.destinationFilePath.replace(/\.html$/, '/index.html'), html, { encoding: 'utf8' })
      console.log(this.relativeSource, '\n ->', this.relativeDestination.replace(/\.html$/, '/index.html'), '\n   ', this.relativeDestination)
    } else {
      console.log(this.relativeSource, '\n ->', this.relativeDestination)
    }

    return this.toJSON()
  }

  async toHTML ({ layout }) {
    let htmlContent = this.htmlContent
    if (layout) {
      htmlContent = `{% extends '${layout}' %}${this.htmlContent}`
    }

    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(this.includesDir)) // const env = nunjucks.configure(this.includesDir)

    if (Array.isArray(this.nunjucksFilters)) {
      this.nunjucksFilters
        .filter(Boolean)
        .filter(f => typeof f.name === 'string' && typeof f.filter === 'function')
        .forEach(f => env.addFilter(f.name, f.filter, !!f.async))
    }

    env.addGlobal('content', this.htmlContent)
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

    return !this.attributes.minify ? renderedContent : minify(renderedContent, {
      collapseBooleanAttributes: true,
      // keepClosingSlash: true,
      collapseWhitespace: true,
      decodeEntities: true,
      html5: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    })
  }
}

function removeFrontMatter (md, bodyBegin) {
  return md.split('\n').filter((_, i) => i >= bodyBegin - 2).join('\n')
}
