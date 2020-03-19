// const fsp = require('fs').promises
const path = require('path')
const glob = require('glob')

const MarkdownFile = require('./files/markdown-file')
const GenericFile = require('./files/generic-file')
const createConfig = require('./create-config')
const getCollectionsFromFiles = require('./get-collections-from-files')

const ignoredFiles = [
  'node_modules',
  'node_modules*',
  '.cache',
  'package.json',
  '.gitignore',
  '_includes',
  '_includes/*',
  '*_includes/*',
  '_site',
  '_site/*',
  '*_site/*'
]

module.exports = scan

async function scan (workingDirectory = process.cwd()) {
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
  const config = createConfig(absoluteWorkingDirectory)

  const filepaths = glob.sync(absoluteWorkingDirectory + '/**/*', {
    nodir: true,
    ignore: ignoredFiles.concat(Array.isArray(config.ignoredFiles) ? config.ignoredFiles : [])
      .map(i => `${absoluteWorkingDirectory}/${i}`)
  })
    .filter(f => !f.includes('_site'))
    .filter(f => !f.includes('node_modules'))
    .filter(f => !f.includes('_includes'))

  const files = filepaths.map(f => toFile(f, absoluteWorkingDirectory, config))

  for (const file of files) { await file.read() }

  const collections = getCollectionsFromFiles(files)

  files.forEach(f => { if (f instanceof MarkdownFile) f.setCollections(collections) })

  return { absoluteWorkingDirectory, filepaths, files, config, collections, workingDirectory }
}

function toFile (sourceFilePath, absoluteWorkingDirectory, config) {
  if (sourceFilePath.endsWith('.md')) {
    return new MarkdownFile(sourceFilePath, absoluteWorkingDirectory, config)
  }
  return new GenericFile(sourceFilePath, absoluteWorkingDirectory)
}
