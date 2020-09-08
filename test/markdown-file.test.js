const { serial: test } = require('ava')
const MarkdownFile = require('../lib/files/markdown-file')
const rimraf = require('rimraf')
const path = require('path')

test.beforeEach(cleanup)
test.after(cleanup)

test('reads file information', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })
  t.truthy(file)
  t.deepEqual(file.url, '/test/')
  await file.read()
  t.deepEqual(file.attributes, {})
  t.snapshot(file.md)
  t.snapshot(file.text)
})

test('reads file information with front matter', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test-with-front-matter.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })
  t.truthy(file)
  t.deepEqual(file.url, '/test-with-front-matter/')
  await file.read()
  t.deepEqual(file.attributes, {
    tags: ['post'],
    title: 'test title'
  })
  t.snapshot(file.md)
  t.snapshot(file.text)
})

test('writes md output file', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })

  await file.read()
  await file.write()
  t.truthy(file.destinationFilePath.endsWith('/test/fixtures/_site/test.html'), file.destinationFilePath)
})

test('writes njk output file', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test-nunjucks.njk')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory })

  await file.read()
  await file.write()
  t.snapshot(file.attributes)
  t.snapshot(file.md)
  t.snapshot(file.text)
  t.snapshot(file.html)
  t.truthy(file.destinationFilePath.endsWith('/test/fixtures/_site/test-nunjucks.html'), file.destinationFilePath)
})

function cleanup () {
  try {
    rimraf.sync(path.resolve(__dirname, 'fixtures', '_site'), { recursive: true })
  } catch (err) { console.error(err) }
}
