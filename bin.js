#!/usr/bin/env node

const { scan, build } = require('.')

main(process.argv[2] || process.cwd())
  .then(() => process.exit(0))
  .catch(err => console.error(err.message, err) && process.exit(1))

async function main (pathParam) {
  console.log('pathParam', pathParam)
  const scanResult = await scan(pathParam)
  console.log('scanResult', scanResult)
  const buildResult = await build(scanResult.absoluteBasedir, scanResult.files)
  console.log('buildResult', buildResult)
}
