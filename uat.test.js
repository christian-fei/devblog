const { serial: test } = require('ava')
const execa = require('execa')

test(`creates static site from markdown files`, async t => {
  const { stdout } = await execa.command('./bin.js test-site')
  const lines = stdout.split('\n')

  t.is(lines[0], 'scanning test-site')
  t.is(lines[1], '1 files found')
  t.is(lines[2], 'processing files..')
  t.is(lines[3], `index.md -> _site/index.html`)
})
