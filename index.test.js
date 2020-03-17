const { serial: test } = require('ava')
const { scan, build } = require('.')

test('resolves absolute basedir', async t => {
  const { absoluteBasedir } = await scan('./test-site')

  t.is(typeof absoluteBasedir, 'string')
  t.truthy(absoluteBasedir.includes(process.cwd()))
})

test('finds mdFiles', async t => {
  const { mdFiles } = await scan('./test-site')

  t.true(Array.isArray(mdFiles))
  t.is(mdFiles.length, 1)
  t.true(mdFiles[0].endsWith('/index.md'))
})

test('converts md files to html files', async t => {
  const { mdFiles } = await scan('./test-site')
  const { errors, succeeded } = await build(mdFiles)

  t.true(Array.isArray(errors))
  t.is(errors.length, 0)

  t.true(Array.isArray(succeeded))
  t.is(succeeded.length, 1)
  t.true(succeeded[0].endsWith('/index.html'))
})
