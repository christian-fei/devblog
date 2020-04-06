const { serial: test } = require('ava')
const GenericFile = require('../lib/files/generic-file')
const fs = require('fs')
const rimraf = require('rimraf')
const path = require('path')

test.beforeEach(cleanup)
test.afterEach(cleanup)

test('write output file', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'image.png')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new GenericFile({ sourceFilePath, absoluteWorkingDirectory })

  const result = await file.write()
  t.truthy(result.destinationFilePath.includes('/test/fixtures/_site/image.png'), result.destinationFilePath)
  t.true(fs.existsSync(result.destinationFilePath))
})

test('skips writes if unchanged', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'image.png')
  const absoluteWorkingDirectory = path.resolve(__dirname, 'fixtures')
  const file = new GenericFile({ sourceFilePath, absoluteWorkingDirectory })

  let result = await file.write()
  t.falsy(result.unchanged)

  result = await file.write()
  t.truthy(result.unchanged)
})

function cleanup () {
  try {
    rimraf.sync(path.resolve(__dirname, 'fixtures', '_site'))
  } catch (err) { console.error(err) }
}
