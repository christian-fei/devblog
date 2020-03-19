const { serial: test } = require('ava')
const GenericFile = require('../lib/generic-file')
const fs = require('fs')
const path = require('path')

test('write output file', async t => {
  const sourceFilePath = path.resolve(__dirname, 'fixtures', 'image.png')
  const absoluteBasedir = path.resolve(__dirname, 'fixtures')
  const file = new GenericFile(sourceFilePath, absoluteBasedir)

  const result = await file.write()
  t.truthy(result.destinationFilePath.includes('/test/fixtures/_site/image.png'), result.destinationFilePath)
  t.true(fs.existsSync(result.destinationFilePath))
})
