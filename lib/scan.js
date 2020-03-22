const path = require('path')
const glob = require('glob')
const merge = require('lodash.merge')

const MarkdownFile = require('./files/markdown-file')
const GenericFile = require('./files/generic-file')
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

async function scan (workingDirectory = process.cwd(), config = {}) {
  const absoluteWorkingDirectory = path.resolve(workingDirectory)

  const filepaths = glob.sync(absoluteWorkingDirectory + '/**/*', {
    nodir: true,
    ignore: ignoredFiles.concat(Array.isArray(config.ignoredFiles) ? config.ignoredFiles : [])
      .map(i => `${absoluteWorkingDirectory}/${i}`)
  })
    .filter(f => !f.includes('_site'))
    .filter(f => !f.includes('node_modules'))
    .filter(f => !f.includes('package-lock.json'))
    .filter(f => !f.includes('package.json'))
    .filter(f => !f.includes('_includes'))
    .filter(f => !f.includes('_data'))

  let files = filepaths.map(f => toFile(f, absoluteWorkingDirectory, config))
  for (const file of files) { await file.read() }
  files = files.filter(f => !f.attributes || !f.attributes.tags || !f.attributes.tags.includes('draft'))

  let collections = getCollectionsFromFiles(files)
  collections = merge({}, config.collections, collections)
  files.forEach(f => { if (f instanceof MarkdownFile) f.setCollections(collections) })

  return { absoluteWorkingDirectory, filepaths, files, config, collections, workingDirectory }
}

function toFile (sourceFilePath, absoluteWorkingDirectory, config) {
  if (sourceFilePath.endsWith('.md') || sourceFilePath.endsWith('.njk')) {
    return new MarkdownFile(sourceFilePath, absoluteWorkingDirectory, config)
  }
  return new GenericFile(sourceFilePath, absoluteWorkingDirectory)
}
