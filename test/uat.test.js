const { serial: test } = require('ava')
const execa = require('execa')
const fs = require('fs')
const path = require('path')
const version = require('../package.json').version

test.before(async () => {
  try {
    fs.rmdirSync(path.resolve(__dirname, 'test-site', '_site'), { recursive: true })
  } catch (err) {
    console.error(err)
  }
})

test(`creates static site from markdown files`, async t => {
  const { stdout } = await execa.command('./bin.js test/test-site')
  const lines = stdout.split('\n')

  t.is(lines[0], `devblog version ${version}`)
  t.is(lines[1], 'scanning test/test-site')
  t.is(lines[2], '3 files found')
  t.is(lines[3], 'processing files..')
  t.is(lines[4], `index.md `)
  t.is(lines[5], ` -> _site/index.html`)
  t.is(lines[6], `test-post.md `)
  t.is(lines[7], ` -> _site/test-post.html`)
  t.is(lines[8], `test-with-collections.md `)
  t.is(lines[9], ` -> _site/test-with-collections.html`)
  t.is(lines[10], undefined)
})
