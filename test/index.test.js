const { serial: test } = require('ava')
const { scan, build } = require('..')
const fs = require('fs')
const path = require('path')

const basedir = path.resolve(__dirname, './test-site')

test('resolves absolute basedir', async t => {
  const { absoluteBasedir } = await scan(basedir)

  t.is(typeof absoluteBasedir, 'string')
  t.truthy(absoluteBasedir.includes(process.cwd()))
})

test('finds files', async t => {
  const { files } = await scan(basedir)

  t.true(Array.isArray(files))
  t.is(files.length, 1)
  t.true(files[0].endsWith('/index.md'))
})

test('converts markdown files to html files', async t => {
  const { absoluteBasedir, files } = await scan(basedir)
  const { errors, results } = await build(absoluteBasedir, files)

  t.true(Array.isArray(errors))
  t.is(errors.length, 0)

  t.true(Array.isArray(results))
  t.is(results.length, 1)
  const { destinationFilePath } = results[0]
  t.true(destinationFilePath.endsWith('/_site/index.html'))

  const htmlContent = fs.readFileSync(destinationFilePath, { encoding: 'utf8' })
  t.snapshot(htmlContent)
})
