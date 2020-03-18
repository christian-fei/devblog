const { serial: test } = require('ava')
const MarkdownFile = require('../lib/markdown-file')
const path = require('path')

test('reads file information', async t => {
  const filepath = path.resolve(__dirname, 'fixtures', 'test.md')
  const absoluteBasedir = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile(filepath, absoluteBasedir)
  t.truthy(file)
  const result = file.read()
  t.deepEqual(result.attributes, {})
  t.snapshot(result.html)
  t.snapshot(result.md)
})
