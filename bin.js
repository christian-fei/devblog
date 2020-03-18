#!/usr/bin/env node

const { scan, build } = require('.')

main(process.argv[2] || process.cwd())
  .then(() => process.exit(0))
  .catch(err => console.error(err.message, err) && process.exit(1))

async function main (pathParam) {
  const { absoluteBasedir, files } = await scan(pathParam)
  console.log(`${files.length} files found`)
  console.log(`processing files..`)

  const { errors, written } = await build(absoluteBasedir, files)
  if (errors.length > 0) {
    console.error(`errors: `)
    console.error(errors.map(e => `"${e.message}" on "${e.filepath}"`).join('\n'))
  }
  if (written.length === 0) {
    console.info('⚠️ no files created')
  } else {
    console.log(written.map(w => `created ${w}`).join('\n'))
  }
}
