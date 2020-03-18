const fs = require('fs')
const path = require('path')
const mkdir = require('./mkdir')

module.exports = class GenericFile {
  constructor (filepath, absoluteBasedir) {
    this.filepath = filepath
    this.absoluteBasedir = absoluteBasedir
    this._sitePath = absoluteBasedir + '/_site'
    this.destinationFilepath = path.resolve(this.filepath.replace(this.absoluteBasedir, this._sitePath))
    this.destinationDirPath = path.resolve(this.destinationFilepath, '..')
  }

  read () { }

  write () {
    mkdir(this.destinationDirPath)
    fs.copyFileSync(this.filepath, this.destinationFilepath)

    return this.destinationFilepath
  }
}
