const { serial: test } = require('ava')
const execa = require('execa')

test(`creates static site from markdown files`, async t => {
  const { stdout } = await execa.command('./bin.js test-site')
  const lines = stdout.split('\n')

  t.is(lines[0], '1 files found')
  t.is(lines[1], 'processing files..')
  t.true(lines[2].startsWith('created '))
  t.true(lines[2].endsWith('/test-site/_site/index.html'))
})
