const test = require('ava')
const path = require('path')
const createConfig = require('../lib/create-config')

test('write output file', async t => {
  const config = createConfig(path.resolve(__dirname, 'fixtures'))
  t.true(Array.isArray(config.nunjucksFilters))
  t.is(config.nunjucksFilters[0].name, 'year')
  t.is(config.nunjucksFilters[0].filter.toString(), '() => new Date().getFullYear()')
})
