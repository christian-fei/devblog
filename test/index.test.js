const { serial: test } = require('ava')
const { scan, build } = require('..')
const fs = require('fs')
const path = require('path')

const workingDirectory = path.resolve(__dirname, './test-site')

test('resolves absolute workingDirectory', async t => {
  const { absoluteWorkingDirectory } = await scan(workingDirectory)

  t.is(typeof absoluteWorkingDirectory, 'string')
  t.truthy(absoluteWorkingDirectory.includes(process.cwd()))
})

test('finds files', async t => {
  const { filepaths } = await scan(workingDirectory)

  t.true(Array.isArray(filepaths))
  t.is(filepaths.length, 1)
  t.true(filepaths[0].endsWith('/index.md'))
})

test('converts markdown files to html files', async t => {
  const { absoluteWorkingDirectory, filepaths } = await scan(workingDirectory)
  const { errors, results } = await build(absoluteWorkingDirectory, filepaths)

  t.true(Array.isArray(errors))
  t.is(errors.length, 0)

  t.true(Array.isArray(results))
  t.is(results.length, 1)
  const { destinationFilePath } = results[0]
  t.true(destinationFilePath.endsWith('/_site/index.html'))

  const htmlContent = fs.readFileSync(destinationFilePath, { encoding: 'utf8' })
  t.snapshot(htmlContent)
})
