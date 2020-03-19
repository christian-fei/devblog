const { serial: test } = require('ava')
const MarkdownFile = require('../lib/files/markdown-file')
const path = require('path')

test('reads file information', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile(sourceFilePath, absoluteWorkingDirectory)
  t.truthy(file)
  const result = await file.read()
  t.deepEqual(result.attributes, {})
  t.snapshot(result.html)
  t.snapshot(result.md)
})

test('reads file information with front matter', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test-with-front-matter.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile(sourceFilePath, absoluteWorkingDirectory)
  t.truthy(file)
  const result = await file.read()
  t.deepEqual(result.attributes, {
    tags: ['post'],
    title: 'test title'
  })
  t.snapshot(result.html)
  t.snapshot(result.md)
})

test('write output file', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile(sourceFilePath, absoluteWorkingDirectory)

  const result = await file.write()
  t.truthy(result.destinationFilePath.includes('/test/fixtures/_site/test.html'), result.destinationFilePath)
})
