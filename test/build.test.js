const { serial: test } = require('ava')
const createConfig = require('../lib/create-config')
const scan = require('../lib/scan')
const build = require('../lib/build')
const fs = require('fs')
const path = require('path')

const workingDirectory = path.resolve(__dirname, './test-site')

test('converts markdown files to html files', async t => {
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
  const config = createConfig(absoluteWorkingDirectory)
  t.snapshot(config)

  const scanResult = await scan(workingDirectory, config)

  const { errors, results } = await build(scanResult)

  t.true(Array.isArray(errors))
  t.is(errors.length, 0)

  t.true(Array.isArray(results))
  t.is(results.length, 3)

  const { destinationFilePath: d0 } = results[0]
  const { destinationFilePath: d1 } = results[1]
  const { destinationFilePath: d2 } = results[2]

  t.true(d0.endsWith('/_site/index.html'), d0)
  t.true(d1.endsWith('/_site/test-post.html'), d1)
  t.true(d2.endsWith('/_site/test-with-collections.html'), d2)

  t.snapshot(fs.readFileSync(d0, { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(d1, { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(d2, { encoding: 'utf8' }))
})
