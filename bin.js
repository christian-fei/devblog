#!/usr/bin/env node

const { scan, build } = require('.')
const createConfig = require('./lib/create-config')

if (require.main === module) {
  run(process.argv[2] || process.cwd())
    .then(() => process.exit(0))
    .catch(err => console.error(err.message, err) && process.exit(1))
} else {
  module.exports = run
}

async function run (pathParam) {
  const { absoluteBasedir, files } = await scan(pathParam)
  console.log(`scanning ${absoluteBasedir.substring(absoluteBasedir.indexOf(pathParam))}`)
  console.log(`${files.length} files found`)
  console.log(`processing files..`)

  const config = createConfig(absoluteBasedir)

  const { errors, results } = await build(absoluteBasedir, files, config)
  if (results.length === 0) {
    console.info('⚠️ no files created')
  } else {
    console.log(results.map(w => `${w.relativeSource} -> ${w.relativeDestination}`).join('\n'))
  }

  if (errors.length > 0) {
    console.error(`errors: `)
    console.error(errors.map(e => `🚫 ${e.sourceFilePath}\n${e.message}`).join('\n'))
  }
}
