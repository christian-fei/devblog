const fs = require('fs')
const path = require('path')
const mkdir = require('./mkdir')

module.exports = class GenericFile {
  constructor (sourceFilePath, absoluteBasedir) {
    this.sourceFilePath = sourceFilePath
    this.absoluteBasedir = absoluteBasedir
    this._sitePath = absoluteBasedir + '/_site'
    this.destinationFilePath = path.resolve(this.sourceFilePath.replace(this.absoluteBasedir, this._sitePath))
    this.destinationDirPath = path.resolve(this.destinationFilePath, '..')
  }

  read () { }

  async write () {
    mkdir(this.destinationDirPath)
    fs.copyFileSync(this.sourceFilePath, this.destinationFilePath)

    return {
      destinationFilePath: this.destinationFilePath,
      source: this.sourceFilePath,
      relativeDestination: this.destinationFilePath.replace(this.absoluteBasedir + '/', ''),
      relativeSource: this.sourceFilePath.replace(this.absoluteBasedir + '/', '')
    }
  }
}
