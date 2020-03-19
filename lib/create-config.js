const merge = require('lodash.merge')
const fs = require('fs')

module.exports = function createConfig (absoluteWorkingDirectory) {
  const customConfigExists = fs.existsSync(absoluteWorkingDirectory + '/.devblog.js')
  if (!customConfigExists) return defaultConfig()
  return merge(defaultConfig(), require(absoluteWorkingDirectory + '/.devblog.js'))
}

function defaultConfig () {
  return {
    nunjucksFilters: [{
      name: 'year',
      filter: () => new Date().getFullYear()
    }]
  }
}
