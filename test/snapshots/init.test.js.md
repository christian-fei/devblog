# Snapshot report for `test/init.test.js`

The actual snapshot is saved in `init.test.js.snap`.

Generated by [AVA](https://avajs.dev).

## initializes site

> Snapshot 1

    {
      nunjucksFilters: [
        {
          filter: Function filter {},
          name: 'year',
        },
      ],
    }

> Snapshot 2

    `---␊
    title: My Devblog␊
    layout: layout.njk␊
    ---␊
    ␊
    {% block content %}␊
    # My Devblog␊
    ␊
    Edit this content and create more Markdown pages,␊
    ␊
    <br>␊
    ␊
    then run `npx devblog` to build your site.␊
    ␊
    <br>␊
    ␊
    <small>Psst. tip 1</small>␊
    ␊
    All you markdown files are automatically grouped by `tags` in the variable called `collections`:␊
    ␊
    ```␊
    {% raw %}␊
    {% for post in collections.post %}␊
      {{ post.title }}␊
    {% endfor %}␊
    {% endraw %}␊
    ```␊
    ␊
    <br>␊
    ␊
    <small>Psst. tip 2</small>␊
    ␊
    <br>␊
    ␊
    You have also to your collections, defined in `.devblog.js` of your site:␊
    ␊
    <ul>␊
      {% for item in collections.items %}␊
        <li>{{ item.name }}</li>␊
      {% endfor %}␊
    </ul>␊
    ␊
    {% endblock %}`

> Snapshot 3

    `<!DOCTYPE html>␊
    <html lang="en">␊
      <head>␊
        <meta charset="UTF-8">␊
        <meta name="viewport" content="width=device-width, initial-scale=1.0">␊
        <title>Document</title>␊
      </head>␊
      <body>␊
        <header>main header</header>␊
        <main>␊
          {% block content %}{% endblock %}␊
        </main>␊
        <footer>main footer</footer>␊
      </body>␊
    </html>`

> Snapshot 4

    `module.exports = {␊
      collections: {␊
        items: [{␊
          name: 'item 1'␊
        }, {␊
          name: 'item 2'␊
        }]␊
      },␊
      nunjucksFilters: [{␊
        name: 'year',␊
        filter: () => new Date().getFullYear()␊
      }]␊
    }`
