const { serial: test } = require('ava')
const scan = require('../lib/scan')
const build = require('../lib/build')
const fs = require('fs')
const path = require('path')

const workingDirectory = path.resolve(__dirname, './test-site')

test('converts markdown files to html files', async t => {
  const { absoluteWorkingDirectory, files, config } = await scan(workingDirectory)
  const { errors, results } = await build({ absoluteWorkingDirectory, files, config })

  t.true(Array.isArray(errors))
  t.is(errors.length, 0)

  t.true(Array.isArray(results))
  t.is(results.length, 2)

  const { destinationFilePath: d0 } = results[0]
  const { destinationFilePath: d1 } = results[1]

  t.true(d0.endsWith('/_site/index.html'), d0)
  t.true(d1.endsWith('/_site/test-post.html'), d1)

  const htmlContent0 = fs.readFileSync(d0, { encoding: 'utf8' })
  t.snapshot(htmlContent0)
  const htmlContent1 = fs.readFileSync(d1, { encoding: 'utf8' })
  t.snapshot(htmlContent1)
})
