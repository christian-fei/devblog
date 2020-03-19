const fs = require('fs')
const path = require('path')
const mkdir = require('../mkdir')
const logger = require('../logger')

module.exports = class GenericFile {
  constructor (sourceFilePath, absoluteWorkingDirectory) {
    this.sourceFilePath = sourceFilePath
    this.absoluteWorkingDirectory = absoluteWorkingDirectory
    this._sitePath = absoluteWorkingDirectory + '/_site'
    this.destinationFilePath = path.resolve(this.sourceFilePath.replace(this.absoluteWorkingDirectory, this._sitePath))
    this.destinationDirPath = path.resolve(this.destinationFilePath, '..')
  }

  async read () { }

  async write () {
    mkdir(this.destinationDirPath)
    fs.copyFileSync(this.sourceFilePath, this.destinationFilePath)
    const size = fs.statSync(this.sourceFilePath).size

    logger.debug(`write generic file results`, size, this.destinationFilePath)

    return {
      additional: { size },
      destinationFilePath: this.destinationFilePath,
      source: this.sourceFilePath,
      relativeDestination: this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', ''),
      relativeSource: this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    }
  }
}
