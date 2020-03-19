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

  t.deepEqual(collections, {
    post: [{
      url: '/test-with-front-matter.html',
      title: 'test title',
      date: undefined,
      html: '<h1>test title</h1>\n<p>test content</p>\n',
      md: '\n# test title\n\ntest content',
      data: {
        title: 'test title',
        tags: [
          'post'
        ]
      }
    }]
  })
})
