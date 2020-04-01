const { serial: test } = require('ava')
const MarkdownFile = require('../lib/files/markdown-file')
const fs = require('fs')
const path = require('path')

test.beforeEach(cleanup)
test.after(cleanup)

test('reads file information', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })
  t.truthy(file)
  t.deepEqual(file.url, '/test/')
  const result = await file.read()
  t.deepEqual(result.attributes, {})
  t.snapshot(result.html)
  t.snapshot(result.md)
})

test('reads file information with front matter', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test-with-front-matter.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })
  t.truthy(file)
  t.deepEqual(file.url, '/test-with-front-matter/')
  const result = await file.read()
  t.deepEqual(result.attributes, {
    tags: ['post'],
    title: 'test title'
  })
  t.snapshot(result.html)
  t.snapshot(result.md)
})

test('writes md output file', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })

  const result = await file.write()
  t.truthy(result.destinationFilePath.endsWith('/test/fixtures/_site/test.html'), result.destinationFilePath)
})

test('skips writes if unchanged', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })

  let result = await file.write()
  t.falsy(result.unchanged)

  result = await file.write()
  t.truthy(result.unchanged)
})

test('writes njk output file', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test-nunjucks.njk')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })

  const result = await file.write()
  t.snapshot(result.attributes)
  t.snapshot(result.md)
  t.snapshot(result.html)
  t.truthy(result.destinationFilePath.endsWith('/test/fixtures/_site/test-nunjucks.html'), result.destinationFilePath)
})

function cleanup () {
  try {
    fs.rmdirSync(path.resolve(__dirname, 'fixtures', '_site'), { recursive: true })
  } catch (err) {}
}
