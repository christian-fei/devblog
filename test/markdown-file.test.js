const { serial: test } = require('ava')
const MarkdownFile = require('../lib/markdown-file')
const path = require('path')

test('reads file information', async t => {
  const filepath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteBasedir = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile(filepath, absoluteBasedir)
  t.truthy(file)
  const result = await file.read()
  t.deepEqual(result.attributes, {})
  t.snapshot(result.html)
  t.snapshot(result.md)
})

test('write output file', async t => {
  const filepath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteBasedir = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile(filepath, absoluteBasedir)

  const result = await file.write()
  t.truthy(result.includes('/test/fixtures/_site/test.html'), result)
})
