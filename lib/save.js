const mkdir = require('./mkdir')
const fs = require('fs')
const path = require('path')

module.exports = save

async function save (absoluteWorkingDirectory, json) {
  mkdir(absoluteWorkingDirectory)

  fs.writeFileSync(path.resolve(absoluteWorkingDirectory, 'site.json'), json, { encoding: 'utf8' })
  console.log('saved site.json')

  return {
  }
}
