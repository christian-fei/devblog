module.exports = files => {
  return files.reduce((acc, file) => {
    const tags = []
    if (file.attributes) {
      if (typeof file.attributes.tag === 'string') tags.push(file.attributes.tag)
      if (Array.isArray(file.attributes.tags)) tags.push(...file.attributes.tags)
    }
    tags.forEach(tag => {
      acc[tag] = acc[tag] || []
      acc[tag].push(file.toJSON())
    })
    return acc
  }, {})
}
