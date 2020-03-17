const { serial: test } = require('ava')
const { scan, build } = require('.')

const basedir = './test-site'

test('resolves absolute basedir', async t => {
  const { absoluteBasedir } = await scan(basedir)

  t.is(typeof absoluteBasedir, 'string')
  t.truthy(absoluteBasedir.includes(process.cwd()))
})

test('finds mdFiles', async t => {
  const { mdFiles } = await scan(basedir)

  t.true(Array.isArray(mdFiles))
  t.is(mdFiles.length, 1)
  t.true(mdFiles[0].endsWith('/index.md'))
})

test('converts md files to html files', async t => {
  const { absoluteBasedir, mdFiles } = await scan(basedir)
  const { errors, written } = await build(absoluteBasedir, mdFiles)

  t.true(Array.isArray(errors))
  t.is(errors.length, 0)

  t.true(Array.isArray(written))
  t.is(written.length, 1)
  t.true(written[0].endsWith('/_site/index.html'))
})
