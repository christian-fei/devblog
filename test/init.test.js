const { serial: test } = require('ava')
const createConfig = require('../lib/create-config')
const init = require('../lib/init')
const fs = require('fs')
const path = require('path')

test.beforeEach(cleanup)
test.after(cleanup)

const workingDirectory = path.resolve(__dirname, './generated-site')
test('initializes site', async t => {
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
  const config = createConfig(absoluteWorkingDirectory)
  t.snapshot(config)

  await init(absoluteWorkingDirectory)

  t.true(fs.existsSync(path.resolve(absoluteWorkingDirectory)))
  t.true(fs.existsSync(path.resolve(absoluteWorkingDirectory, 'index.md')))
  t.true(fs.existsSync(path.resolve(absoluteWorkingDirectory, '_includes', 'layout.njk')))
  t.snapshot(fs.readFileSync(path.resolve(absoluteWorkingDirectory, 'index.md'), { encoding: 'utf8' }))
  t.snapshot(fs.readFileSync(path.resolve(absoluteWorkingDirectory, '_includes', 'layout.njk'), { encoding: 'utf8' }))
})

function cleanup () {
  try {
    fs.rmdirSync(workingDirectory, { recursive: true })
  } catch (err) {}
}
