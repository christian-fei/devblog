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

  const [{ destinationFilePath: dest0 }, { destinationFilePath: dest1 }, { destinationFilePath: dest2 }] = [results[0], results[1], results[2]]

  t.true(dest0.endsWith('/_site/index.html'), dest0)
  t.true(dest1.endsWith('/_site/test-post.html'), dest1)
  t.true(dest2.endsWith('/_site/test-with-collections.html'), dest2)

  t.snapshot(fs.readFileSync(dest0, { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(dest1, { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(dest2, { encoding: 'utf8' }))

  t.deepEqual(fs.readFileSync(dest1, { encoding: 'utf8' }), fs.readFileSync(dest1.replace(/\.html$/, '/index.html'), { encoding: 'utf8' }))
  t.deepEqual(fs.readFileSync(dest2, { encoding: 'utf8' }), fs.readFileSync(dest2.replace(/\.html$/, '/index.html'), { encoding: 'utf8' }))
})
