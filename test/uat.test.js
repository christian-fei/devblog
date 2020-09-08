const { serial: test } = require('ava')
const execa = require('execa')
const fs = require('fs')
const rimraf = require('rimraf')
const path = require('path')
const version = require('../package.json').version

test.beforeEach(cleanup)
test.after(cleanup)

test('creates static site from markdown files', async t => {
  const { stdout } = await execa.command('./bin.js test/test-site --cache')
  const line = iterable(stdout.split('\n'))

  t.is(line(), `devblog version ${version}`)
  t.is(line(), 'scanning test/test-site')
  t.is(line(), '4 files found')
  t.is(line(), 'processing files..')
  t.is(line(), 'index.md ')
  t.is(line(), ' -> _site/index.html')
  t.is(line(), 'test-post.md ')
  t.is(line(), ' -> _site/test-post/index.html ')
  t.is(line(), '    _site/test-post.html')
  t.is(line(), 'test-with-collections.md ')
  t.is(line(), ' -> _site/test-with-collections/index.html ')
  t.is(line(), '    _site/test-with-collections.html')
  t.is(line(), 'test-with-tags.md ')
  t.is(line(), ' -> _site/test-with-tags/index.html ')
  t.is(line(), '    _site/test-with-tags.html')
  t.is(line(), 'saved site.json')
  t.is(line(), undefined)

  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site')))
  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site', 'index.html')))
  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site', 'test-post.html')))
  t.truthy(fs.existsSync(path.resolve(__dirname, 'test-site', '_site', 'test-with-collections.html')))

  t.snapshot(fs.readFileSync(path.resolve(__dirname, 'test-site', '_site', 'index.html'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(__dirname, 'test-site', '_site', 'test-post.html'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(__dirname, 'test-site', '_site', 'test-with-collections.html'), { encoding: 'utf8' }))
})

test('a user can create a blog from scratch with "devblog init"', async t => {
  const generatedSitePath = path.resolve(__dirname, 'generated-site')
  const { stdout } = await execa.command(`./bin.js init ${generatedSitePath} --cache`)
  const line = iterable(stdout.split('\n'))

  t.is(line(), `devblog version ${version}`)
  t.is(line(), `initializing site at ${path.resolve(__dirname)}/generated-site`)
  t.is(line(), `created ${path.resolve(__dirname)}/generated-site/index.md`)
  t.is(line(), `created ${path.resolve(__dirname)}/generated-site/.devblog.js`)
  t.is(line(), `created ${path.resolve(__dirname)}/generated-site/_includes/layout.njk`)
  t.is(line(), `scanning ${path.resolve(__dirname)}/generated-site`)
  t.is(line(), '1 files found')
  t.is(line(), 'processing files..')
  t.is(line(), 'index.md ')
  t.is(line(), ' -> _site/index.html')
  t.is(line(), 'saved site.json')
  t.is(line(), undefined)

  t.true(fs.existsSync(path.resolve(generatedSitePath)))
  t.true(fs.existsSync(path.resolve(generatedSitePath, 'index.md')))
  t.true(fs.existsSync(path.resolve(generatedSitePath, '_includes', 'layout.njk')))
  t.true(fs.existsSync(path.resolve(generatedSitePath, '.devblog.js')))
  t.snapshot(fs.readFileSync(path.resolve(generatedSitePath, 'index.md'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(generatedSitePath, '_includes', 'layout.njk'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(generatedSitePath, '.devblog.js'), { encoding: 'utf8' }))

  t.true(fs.existsSync(path.resolve(generatedSitePath, '_site', 'index.html')))
  t.snapshot(fs.readFileSync(path.resolve(generatedSitePath, '_site', 'index.html'), { encoding: 'utf8' }))
})

function cleanup () {
  try {
    rimraf.sync(path.resolve(__dirname, 'test-site', '_site'), { recursive: true })
  } catch (err) { console.error(err) }

  try {
    rimraf.sync(path.resolve(__dirname, 'generated-site'), { recursive: true })
  } catch (err) { console.error(err) }
}

function iterable (arr = [], index = 0) {
  return () => {
    return arr[index++]
  }
}