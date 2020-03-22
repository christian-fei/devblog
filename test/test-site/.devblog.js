module.exports = {
  collections: {
    items: [{
      name: 'item 1'
    }, {
      name: 'item 2'
    }]
  },
  nunjucksFilters: [{
    name: 'year',
    filter: () => new Date().getFullYear()
  }]
}