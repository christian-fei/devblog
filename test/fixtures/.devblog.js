module.exports = {
  nunjucksFilters: [{
    name: 'year',
    filter: () => new Date().getFullYear()
  }]
}