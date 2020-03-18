const { serial: test } = require('ava')
const GenericFile = require('../lib/generic-file')
const fs = require('fs')
const path = require('path')

test('write output file', async t => {
  const filepath = path.resolve(__dirname, 'fixtures', 'image.png')
  const absoluteBasedir = path.resolve(__dirname, 'fixtures')
  const file = new GenericFile(filepath, absoluteBasedir)

  const result = file.write()
  t.truthy(result.includes('/test/fixtures/_site/image.png'), result)
  t.true(fs.existsSync(result))
})
