# Mink

> Remix your Markdown with this live Markdown server and static-site generator

[![Build Status](https://travis-ci.com/minkjs/mink.svg?token=qoHuwCLMzrVokCyqzWgj&branch=master)](https://travis-ci.com/minkjs/mink)
[![Coverage Status](https://coveralls.io/repos/github/minkjs/mink/badge.svg?branch=master&t=Z79OeA)](https://coveralls.io/github/minkjs/mink?branch=master)
[![Npm Version](https://img.shields.io/npm/v/mink.svg)](https://www.npmjs.com/package/mink)
[![Github Issues](https://img.shields.io/github/issues/minkjs/mink.svg)](https://github.com/minkjs/mink/issues)
[![Known Vulnerabilities](https://snyk.io/test/github/minkjs/mink/badge.svg)](https://snyk.io/test/github/minkjs/mink)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## About Mink

Use cases

- Web Server with live Markdown preview
- Static-site generator
- Software documentation tool
- Website generator

## How Mink Works

Mink launches an HTTP server from a local directory.

```shell
cd ~/repos/my-site
mink
```


- Mink renders your Markdown files as HTTP on the fly.
- Mink watches your files for changes, and re-renders them to all of your devices simultaneously.
- Mink exports your project to static files that can be uploaded to a server.

### Mixed-Mode Markdown

Mink uses Mixed-Mode Markdown, combining Handlebars templates with Markdown syntax.

```html
{{#each article}}
<article>
    <h2>{{article.title}}</h2>
</article>
{{/each}}
```

### Include Syntax

Mink adds includes syntax to your HTML and Markdown files.

```
<!-- File: index.html -->
<head>
	<!-- mink: styles.less -->
</head>
<body>
	<!-- mink: home-page.md -->
</body>
```

### Re-Usable Project Configuration

Mink lets your configure your projects with `Minkconf.js`.

```javascript
// File: Minkconf.js

const Minkconf = {
	plugins: {
		markdown: {
			path: '**/*.md'
			handler: 'mink-markdown'
		}
	},
	watch: {
		'**/*.md'
	},
	export: {
		'**/*.md'
	}
}

module.exports = Minkconf
```

### Custom Handlers

Mink lets you rapidly build custom handlers for http routes.


```javascript
// File: Minkconf.js

const typescript = require('typescript')

const Minkconf = {
	plugins: {
		typescript: {
			path: '**/*.ts'
			handler: $file => ts.transpileModule($file.contents).outputText
		}
	}
}

module.exports = Minkconf
```



## Why Mink Exists

1. Software Documentation
1. Blog and Static-Site Creation
1. Pull-Mode Task Runner

Mink is a powerful command-line tool used to produce written content for the web. Mink is designed from the ground up for technical writting, blogging and software documentation. Mink lets you slice, dice and remix structured Markdown content in realtime. Mink serves your content while you create, then exports your flattened project as part of your build pipeline.



## Getting Started

Installation:

```shell
yarn --global add mink
```

Launch server from the current directory:

```shell
mink
```



## Features

- Simple project configuration file (Markconf.js)
- Mink Server
	+ Serves local directories as content
	+ Markdown files are converted to HTML
	+ Auto-reload on file changes
- Splice structrued content together, Eg:
	+ HTML inside HTML with: `<!-- mink | path/to/foo.html -->`
	+ Markdown inside Markdown with: `<!-- mink | path/to/bar.md -->`
	+ Fetch external content:  `<!-- mink | https://en.wikipedia.org/wiki/Cat -->`
	+ Get the first 100 Fibonacci numbers from a plugin:  `<!-- mink | fibonacci | {n: 100} -->`
- Plugins
	+ Write local project modules with simple plugin architecture
	+ Publish your module to the NPM Registry
	+ Add your module to your `package.json` file
	+ Plugins can have their own Handlebars HTML templates
	+ Plugins can return a `{body}` object to be rendered to a template
	+ Pluings can also override and send the HTTP response themselves
- Export
	+ Export the entire content as HTML to be uploaded
	+ Export directory structure alongside binary files like images
	+ Export to PDF

## Installation

Mink serves Markdown content from anywhere in your filesystem. You can install Mink globally.

```shell
yarn global add mink
```

