const log = require('debug')('scan')
const path = require('path')
const fs = require('fs')
const merge = require('lodash.merge')
const pLimit = require('p-limit')
const limit = pLimit(require('os').cpus().length * 2)

const MarkdownFile = require('./files/markdown-file')
const GenericFile = require('./files/generic-file')
const getCollectionsFromFiles = require('./get-collections-from-files')

module.exports = scan

const alwaysIgnore = [
  '.cache',
  '.DS_Store',
  '.gitignore',
  '.npmrc',
  '.devblog.js',
  '.git',
  '.github',
  '_site',
  'node_modules',
  'site.json',
  'package-lock.json',
  'package.json',
  '_includes',
  'secrets',
  '_data'
]

async function scan (workingDirectory = process.cwd(), config = {}) {
  const absoluteWorkingDirectory = path.resolve(workingDirectory)
  log(`absoluteWorkingDirectory ${absoluteWorkingDirectory}`)

  const filepaths = glob(absoluteWorkingDirectory)
    .filter(Boolean)
    .filter(f =>
      Array.isArray(config.ignoredFiles)
        ? !config.ignoredFiles.some(s => new RegExp(s).test(f)) : true)
  log(`filepaths.length ${filepaths.length}`)

  let files = filepaths.map(f => toFile(f, absoluteWorkingDirectory, config))
  await Promise.all(files.map(file => limit(() => {
    log(`reading ${file.relativeSource}`)
    return file.read()
  })))
  // for (const file of files) {
  //   await file.read()
  //     .catch(err => console.log('oops', file.sourceFilePath, file.url, err.message, err))
  //   log(`read ${file.relativeSource}`)
  // }
  if (process.env.DRAFTS !== 'true') {
    files = files.filter(f => !f.attributes || !f.attributes.tags || !f.attributes.tags.includes('draft'))
  }
  log(`files.length ${files.length}`)

  let collections = getCollectionsFromFiles(files)
  collections = merge({}, config.collections, collections)
  files.forEach(f => { if (f instanceof MarkdownFile) f.setCollections(collections) })

  return { absoluteWorkingDirectory, filepaths, files, config, collections, workingDirectory }
}

function toFile (sourceFilePath, absoluteWorkingDirectory, config) {
  if (sourceFilePath.endsWith('.md') || sourceFilePath.endsWith('.njk')) {
    return new MarkdownFile({ sourceFilePath, absoluteWorkingDirectory, config })
  }
  return new GenericFile({ sourceFilePath, absoluteWorkingDirectory })
}

function glob (dir, filelist = []) {
  var files = fs.readdirSync(dir)
  for (const file of files) {
    if (!alwaysIgnore.some(ignore => file.endsWith(ignore))) {
      if (fs.statSync(path.resolve(dir, file)).isDirectory()) {
        filelist.push(...glob(path.resolve(dir, file)))
      } else {
        filelist.push(path.resolve(dir, file))
      }
    }
  }
  return filelist
}
