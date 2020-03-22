const { serial: test } = require('ava')
const execa = require('execa')
const version = require('../package.json').version

test(`creates static site from markdown files`, async t => {
  const { stdout } = await execa.command('./bin.js test/test-site')
  const lines = stdout.split('\n')

  t.is(lines[0], `devblog version ${version}`)
  t.is(lines[1], 'scanning test/test-site')
  t.is(lines[2], '2 files found')
  t.is(lines[3], 'processing files..')
  t.is(lines[4], `index.md -> _site/index.html`)
  t.is(lines[5], `test-post.md -> _site/test-post.html`)
  t.is(lines[6], undefined)
})
