const { serial: test } = require('ava')
const path = require('path')
const MarkdownFile = require('../lib/files/markdown-file')
const getCollectionsFromFiles = require('../lib/get-collections-from-files')

test('parses collections from file attributes', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'test-with-front-matter.md')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new MarkdownFile(sourceFilePath, absoluteWorkingDirectory)
  await file.read()

  const collections = getCollectionsFromFiles([file])

  t.deepEqual(Object.keys(collections), ['post'])
  t.true(Array.isArray(collections.post))
  t.is(collections.post.length, 1)
})
