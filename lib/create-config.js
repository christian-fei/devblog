const merge = require('lodash.merge')
const fs = require('fs')

module.exports = function createConfig (absoluteBasedir) {
  const customConfigExists = fs.existsSync(absoluteBasedir + '/.devblog.js')
  if (!customConfigExists) return defaultConfig()
  return merge(defaultConfig(), require(absoluteBasedir + '/.devblog.js'))
}

function defaultConfig () {
  return {
    nunjucksFilters: [{
      name: 'year',
      filter: () => new Date().getFullYear()
    }]
  }
}
