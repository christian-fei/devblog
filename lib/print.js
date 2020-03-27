module.exports = {
  scanResult,
  buildResults,
  buildErrors,
  version
}

function scanResult ({ absoluteWorkingDirectory, filepaths, workingDirectory }) {
  console.log(`scanning ${absoluteWorkingDirectory.substring(absoluteWorkingDirectory.indexOf(workingDirectory))}`)
  console.log(`${filepaths.length} files found`)
  console.log(`processing files..`)
}

function buildResults (results) { results.length === 0 && console.info('⚠️ no files created') }

function buildErrors (errors) {
  if (errors.length > 0) {
    console.error(`errors: `)
    console.error(errors.map(e => `🚫 ${e.sourceFilePath}\n${e.message}`).join('\n'))
  }
}

function version (v) { console.log(`devblog version ${v}`) }
