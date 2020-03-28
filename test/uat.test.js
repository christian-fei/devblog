const { serial: test } = require('ava')
const execa = require('execa')
const fs = require('fs')
const path = require('path')
const version = require('../package.json').version

test.beforeEach(cleanup)
test.after(cleanup)

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

  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site')))
  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site', 'index.html')))
  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site', 'test-post.html')))
  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site', 'test-with-collections.html')))

  t.snapshot(fs.readFileSync(path.resolve(__dirname, 'test-site', '_site', 'index.html'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(__dirname, 'test-site', '_site', 'test-post.html'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(__dirname, 'test-site', '_site', 'test-with-collections.html'), { encoding: 'utf8' }))
})

test.only(`a user can create a blog from scratch with "devblog init"`, async t => {
  const generatedSitePath = path.resolve(__dirname, 'generated-site')
  const { stdout } = await execa.command(`./bin.js init ${generatedSitePath}`)
  const lines = stdout.split('\n')

  t.truthy(lines)
  t.is(lines[0], `devblog version ${version}`)
  t.is(lines[1], `initializing site at ${path.resolve(__dirname)}/generated-site`)
  t.is(lines[2], `created ${path.resolve(__dirname)}/generated-site/index.md`)
  t.is(lines[3], `created ${path.resolve(__dirname)}/generated-site/_includes/layout.njk`)
  t.is(lines[4], undefined)

  t.true(fs.existsSync(path.resolve(generatedSitePath)))
  t.true(fs.existsSync(path.resolve(generatedSitePath, 'index.md')))
  t.true(fs.existsSync(path.resolve(generatedSitePath, '_includes', 'layout.njk')))
  t.snapshot(fs.readFileSync(path.resolve(generatedSitePath, 'index.md'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(generatedSitePath, '_includes', 'layout.njk'), { encoding: 'utf8' }))
})

function cleanup () {
  try {
    fs.rmdirSync(path.resolve(__dirname, 'test-site', '_site'), { recursive: true })
  } catch (err) {}

  try {
    fs.rmdirSync(path.resolve(__dirname, 'generated-site'), { recursive: true })
  } catch (err) {}
}
