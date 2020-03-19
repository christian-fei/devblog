module.exports = {
  scanResult,
  buildResults,
  buildErrors
}

function scanResult ({ absoluteWorkingDirectory, filepaths, pathParam }) {
  console.log(`scanning ${absoluteWorkingDirectory.substring(absoluteWorkingDirectory.indexOf(pathParam))}`)
  console.log(`${filepaths.length} files found`)
  console.log(`processing files..`)
}

function buildResults (results) {
  if (results.length === 0) {
    console.info('⚠️ no files created')
  } else {
    console.log(results.map(w => `${w.relativeSource} -> ${w.relativeDestination}`).join('\n'))
  }
}
function buildErrors (errors) {
  if (errors.length > 0) {
    console.error(`errors: `)
    console.error(errors.map(e => `🚫 ${e.sourceFilePath}\n${e.message}`).join('\n'))
  }
}
