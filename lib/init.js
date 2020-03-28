const mkdir = require('./mkdir')
const fs = require('fs')
const path = require('path')

module.exports = init

async function init (absoluteWorkingDirectory) {
  mkdir(absoluteWorkingDirectory)
  console.log('initializing site at', absoluteWorkingDirectory)

  fs.writeFileSync(path.resolve(absoluteWorkingDirectory, 'index.md'), indexMd(), { encoding: 'utf8' })
  console.log('created', path.resolve(absoluteWorkingDirectory, 'index.md'))

  fs.writeFileSync(path.resolve(absoluteWorkingDirectory, '.devblog.js'), devblogJs(), { encoding: 'utf8' })
  console.log('created', path.resolve(absoluteWorkingDirectory, '.devblog.js'))

  mkdir(path.resolve(absoluteWorkingDirectory, '_includes'))
  fs.writeFileSync(path.resolve(absoluteWorkingDirectory, '_includes', 'layout.njk'), layoutNjk(), { encoding: 'utf8' })
  console.log('created', path.resolve(absoluteWorkingDirectory, '_includes', 'layout.njk'))

  return {
  }
}

function indexMd () {
  return `
---
title: My Devblog
layout: layout.njk
---

{% block content %}
# My Devblog

Edit this content and create more Markdown pages,

<br>

then run \`npx devblog\` to build your site
{% endblock %}
`.trim()
}

function devblogJs () {
  return `
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
`.trim()
}

function layoutNjk () {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <header>main header</header>
    <main>
      {% block content %}{% endblock %}
    </main>
    <footer>main footer</footer>
  </body>
</html>
`.trim()
}
