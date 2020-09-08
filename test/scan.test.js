const { serial: test } = require('ava')
const scan = require('../lib/scan')
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
  t.is(filepaths.length, 4)
  t.true(filepaths[0].endsWith('/index.md'))
  t.true(filepaths[1].endsWith('/test-post.md'))
  t.true(filepaths[2].endsWith('/test-with-collections.md'))
  t.true(filepaths[3].endsWith('/test-with-tags.md'))
})
