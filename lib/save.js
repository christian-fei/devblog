const mkdir = require('./mkdir')
const fs = require('fs')
const path = require('path')

module.exports = save

async function save (absoluteWorkingDirectory, json) {
  mkdir(absoluteWorkingDirectory)

  fs.writeFileSync(path.resolve(absoluteWorkingDirectory, 'site.json'), JSON.stringify(json, null, 2), { encoding: 'utf8' })
  console.log('saved site.json')

  return {
  }
}
