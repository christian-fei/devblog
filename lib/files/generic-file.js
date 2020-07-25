const fs = require('fs')
const path = require('path')
const mkdir = require('../mkdir')

module.exports = class GenericFile {
  constructor ({ sourceFilePath, absoluteWorkingDirectory } = {}) {
    this.sourceFilePath = sourceFilePath
    this.absoluteWorkingDirectory = absoluteWorkingDirectory
    this._sitePath = absoluteWorkingDirectory + '/_site'
    this.destinationFilePath = path.resolve(this.sourceFilePath.replace(this.absoluteWorkingDirectory, this._sitePath))
    this.destinationDirPath = path.resolve(this.destinationFilePath, '..')
    this.relativeDestination = this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    this.relativeSource = this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    this.content = ''
  }

  async read () {
    this.content = fs.readFileSync(this.sourceFilePath)
  }

  toJSON () {
    return {
      destinationFilePath: this.destinationFilePath,
      source: this.sourceFilePath,
      relativeDestination: this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', ''),
      relativeSource: this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    }
  }

  async write () {
    mkdir(this.destinationDirPath)
    fs.copyFileSync(this.sourceFilePath, this.destinationFilePath)

    console.log(this.relativeSource, '\n ->', this.relativeDestination)

    return this.toJSON()
  }
}
