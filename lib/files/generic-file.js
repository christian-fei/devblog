const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mkdir = require('../mkdir')
const logger = require('../logger')

module.exports = class GenericFile {
  constructor (sourceFilePath, absoluteWorkingDirectory) {
    this.sourceFilePath = sourceFilePath
    this.absoluteWorkingDirectory = absoluteWorkingDirectory
    this._sitePath = absoluteWorkingDirectory + '/_site'
    this.destinationFilePath = path.resolve(this.sourceFilePath.replace(this.absoluteWorkingDirectory, this._sitePath))
    this.destinationDirPath = path.resolve(this.destinationFilePath, '..')
    this.relativeDestination = this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    this.relativeSource = this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
  }

  async read () { }

  toJSON () {
    return {
      destinationFilePath: this.destinationFilePath,
      source: this.sourceFilePath,
      relativeDestination: this.destinationFilePath.replace(this.absoluteWorkingDirectory + '/', ''),
      relativeSource: this.sourceFilePath.replace(this.absoluteWorkingDirectory + '/', '')
    }
  }

  async write () {
    if (fs.existsSync(this.destinationFilePath)) {
      const destinationContent = fs.readFileSync(this.destinationFilePath)
      const sourceContent = fs.readFileSync(this.sourceFilePath)
      const sourceHash = crypto.createHash('md5').update(sourceContent).digest('hex')
      const destinationHash = crypto.createHash('md5').update(destinationContent).digest('hex')
      if (destinationHash === sourceHash) {
        console.log('unchanged', this.destinationFilePath, sourceHash)
        return this.toJSON()
      }
    }

    mkdir(this.destinationDirPath)
    fs.copyFileSync(this.sourceFilePath, this.destinationFilePath)

    console.log(this.relativeSource, '\n ->', this.relativeDestination)

    return this.toJSON()
  }
}
