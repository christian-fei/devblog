const { serial: test } = require('ava')
const { scan, build } = require('..')
const fs = require('fs')
const path = require('path')

const workingDirectory = path.resolve(__dirname, './test-site')

test('converts markdown files to html files', async t => {
  const { absoluteWorkingDirectory, files, config } = await scan(workingDirectory)
  const { errors, results } = await build(absoluteWorkingDirectory, files, config)

  t.true(Array.isArray(errors))
  t.is(errors.length, 0)

  t.true(Array.isArray(results))
  t.is(results.length, 1)
  const { destinationFilePath } = results[0]
  t.true(destinationFilePath.endsWith('/_site/index.html'))

  const htmlContent = fs.readFileSync(destinationFilePath, { encoding: 'utf8' })
  t.snapshot(htmlContent)
})
