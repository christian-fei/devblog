yet another static site generator

```
npm i -g devblog
```

[read more about it on cri.dev](https://cri.dev/posts/2020-04-19-devblog-yet-another-static-site-generator-seriously/)

## create a blog

```
devblog init my-new-blog && cd my-new-blog # optional, creates a blog
devblog # build blog
```

or try to run it a 11ty or similar blog, it will give you hints on what filters and variables need to be configured in the file `.devblog.js` (see [`.devblog.example.js`](https://github.com/christian-fei/devblog/blob/master/test/test-site/.devblog.js)).

You can also find an example in the [example test-site](https://github.com/christian-fei/devblog/tree/master/test/test-site).

## serve on localhost:8080

```
npx http-server _site
```

run in a directory with `*.md` files, and a `_site` will be generated containing html files.

you can use nunjucks templates, as you can see in [test-site](https://github.com/christian-fei/devblog/tree/master/test/test-site)

[![asciicast](https://asciinema.org/a/aUEeBmo0ev9TOZHsStiNyojvs.svg)](https://asciinema.org/a/aUEeBmo0ev9TOZHsStiNyojvs)
